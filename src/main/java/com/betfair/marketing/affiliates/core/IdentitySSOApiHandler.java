package com.betfair.marketing.affiliates.core;

import com.betfair.marketing.affiliates.config.Settings;
import org.apache.commons.lang3.text.WordUtils;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Encoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import java.net.URI;

import static com.betfair.marketing.affiliates.config.Settings.*;
import static com.betfair.marketing.affiliates.util.Utils.productTokenValid;

@Path("identity/{brand}/productToken")
public class IdentitySSOApiHandler {
    private static final Logger LOG = LoggerFactory.getLogger(IdentitySSOApiHandler.class);
    private static final int REDIRECT_STATUS = 302;
    private static final int EXPIRATION_SECONDS = 1200;
    private static final String PATH = "/affiliate-integration";
    private static final String HOST = "Host";
    private static final int FORBIDDEN_STATUS = 403;
    private static String DOMAIN = Settings.getDomain();
    private Encoder encoder = ESAPI.encoder();

    @POST
    public Response handleRequestPost(@PathParam("brand") String brand, @FormParam("productToken") String requestProductToken, @Context HttpServletRequest request) {
        if (isOriginInvalid(brand, request)) return Response.status(FORBIDDEN_STATUS).build();
        return setResponseBody(requestProductToken, encoder.encodeForJavaScript(brand));
    }

    @GET
    public Response handleRequestGet(@PathParam("brand") String brand, @FormParam("productToken") String requestProductToken, @Context HttpServletRequest request) {
        if (isOriginInvalid(brand, request)) return Response.status(FORBIDDEN_STATUS).build();
        return setResponseBody(requestProductToken, encoder.encodeForJavaScript(brand));
    }

    private boolean isOriginInvalid(@PathParam("brand") String brand, @Context HttpServletRequest request) {
        String requestHost = request.getHeader(HOST);
        return !Settings.getAllowedHost(brand).equals(requestHost) && !requestHost.contains(DOMAIN);
    }

    private Response setResponseBody(String requestProductToken, String brand) {
        String brandCapitalize = WordUtils.capitalize(brand);

        if (requestProductToken != null && productTokenValid(requestProductToken)) {
            NewCookie newProductToken = new NewCookie("productToken" + brandCapitalize, requestProductToken, PATH, DOMAIN, "", EXPIRATION_SECONDS, false);
            NewCookie newProductChecked = new NewCookie("productChecked" + brandCapitalize, "true", PATH, DOMAIN, "", EXPIRATION_SECONDS, false);
            URI redirectUrl = URI.create(getMyAccountUrl(brand));
            return Response.status(REDIRECT_STATUS).cookie(newProductToken, newProductChecked).location(redirectUrl).build();
        } else {
            NewCookie newProductChecked = new NewCookie("productChecked" + brandCapitalize, "false", PATH, DOMAIN, "", EXPIRATION_SECONDS, false);
            URI redirectURI = URI.create(
                    getIdentityLoginViewUrl(brand.toLowerCase())
                            + "?" + "product=" + getIdentityProductName(brand)
                            + "&url="
                            + getCallbackUrl(brand.toLowerCase()));
            return Response.temporaryRedirect(redirectURI).cookie(newProductChecked).build();
        }
    }


}

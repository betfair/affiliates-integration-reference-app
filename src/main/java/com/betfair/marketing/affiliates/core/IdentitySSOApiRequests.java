package com.betfair.marketing.affiliates.core;

import com.betfair.marketing.affiliates.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import static com.betfair.marketing.affiliates.config.Settings.*;

@Path("identity/{brand}/request/productToken")
public class IdentitySSOApiRequests {
    private static final Logger LOG = LoggerFactory.getLogger(SportsbookApiHandler.class);
    private static final String POST_REQUEST = "POST";
    private static final String CONTENT_TYPE = "application/x-www-form-urlencoded; charset=UTF-8";
    private static final int CONNECT_TIMEOUT = 15000;

    @POST
    public void handleRequestPost(@PathParam("brand") String brand) throws IOException {
        getProductToken(brand);
    }

    @GET
    public Response handleRequestGet(@PathParam("brand") String brand) throws IOException {
        return getProductToken(brand).build();

    }

    private Response.ResponseBuilder getProductToken(String brand) {
        HttpURLConnection connection = establishConnectionWithIdentitySso(brand);
        StringJoiner paramsUrl = createRequestParams(brand);
        executeRequest(connection, paramsUrl);
        String location = connection.getHeaderField("location");
        return Response.temporaryRedirect(URI.create(location));
    }

    private void executeRequest(HttpURLConnection connection, StringJoiner paramsUrl) {
        try (OutputStream outputStream = connection.getOutputStream()) {
            outputStream.write(paramsUrl.toString().getBytes());
        } catch (IOException e) {
            LOG.error("Could not make the request to identity", e);
        }
    }

    private StringJoiner createRequestParams(String brand) {
        Map<String, String> params = new HashMap<>();
        params.put("url", getCallbackUrl(brand));
        params.put("product", getIdentityProductName(brand));
        params.put("redirectMethod", POST_REQUEST);

        return Utils.createParamsUrl(params);
    }

    private HttpURLConnection establishConnectionWithIdentitySso(String brand) {
        HttpURLConnection connection;
        String urlToConnect = getIdentityProductTokenUrl(brand);

        try {
            URL url = new URL(urlToConnect);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(POST_REQUEST);
        } catch (IOException e) {
            throw new RuntimeException("The connection couldn't be established " + urlToConnect);
        }
        connection.setDoOutput(true);
        connection.setConnectTimeout(CONNECT_TIMEOUT);
        connection.setRequestProperty("Content-Type", CONTENT_TYPE);
        connection.setRequestProperty("X-Application", getSportsbookKey(brand.toLowerCase()));
        connection.setInstanceFollowRedirects(true);

        return connection;
    }
}

package com.betfair.marketing.affiliates.config;

import org.json.simple.JSONObject;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import static com.betfair.marketing.affiliates.config.Settings.*;

@Produces(MediaType.APPLICATION_JSON)
@Path("request/settings")
public class BrandsSettings {

    private JSONObject createBrandSettingsJson(String brand) {
        JSONObject urls = new JSONObject();
        urls.put("myAccountLink", getMyAccountUrl(brand));
        urls.put("registerLink", getRegistrationUrl(brand));
        urls.put("productTokenLink", getIdentityProductTokenUrl(brand));
        urls.put("autoSubmittableForm", getAffiliateProductTokenFormUrl(brand));
        urls.put("origin", getBrandOrigin(brand));
        urls.put("identityCallback", getCallbackUrl(brand));
        urls.put("myBetsLink", Settings.getMyBetsUrl(brand));
        urls.put("openAccountLink", Settings.getOpenAccountUrl(brand));
        return urls;
    }

    @GET
    public JSONObject response() {
        JSONObject response = new JSONObject();
        JSONObject brandsSettings = new JSONObject();
        brandsSettings.put("betfair", createBrandSettingsJson("betfair"));
        brandsSettings.put("paddypower", createBrandSettingsJson("paddypower"));
        response.put("settings", brandsSettings);
        return response;
    }
}

package com.betfair.marketing.affiliates.util;

import com.betfair.marketing.affiliates.config.Settings;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.betfair.marketing.affiliates.config.PropertyNames.IDENTITY_PRODUCT_NAME;
import static com.betfair.marketing.affiliates.config.Settings.getSportsbookUser;

public class Utils {
    private static final String CHARSET = "UTF-8";
    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(Utils.class);

    public static StringJoiner createParamsUrl(Map<String, String> requestBody) {
        StringJoiner paramsList = new StringJoiner("&");
        for (Map.Entry<String, String> entry : requestBody.entrySet()) {
            encodeParameter(paramsList, entry);
        }
        return paramsList;
    }

    private static void encodeParameter(StringJoiner paramsList, Map.Entry<String, String> entry) {
        try {
            paramsList.add(URLEncoder.encode(entry.getKey(), CHARSET) + "=" + URLEncoder.encode(entry.getValue(), CHARSET));
        } catch (UnsupportedEncodingException e) {
            LOG.error("Error when encoding request parameters", e);
        }
    }

    public static Map<String, String> createRequestBody(String brand) {
        Map<String, String> params = new HashMap<>();
        params.put("username", getSportsbookUser(brand));
        params.put("password", Settings.getSportsbookPassword(brand));
        params.put("product", IDENTITY_PRODUCT_NAME);
        params.put("url", Settings.getCallbackUrl(brand));
        return params;
    }

    public static HttpURLConnection createNewHttpConnection(String url, String applicationKey, String productToken, String type, boolean sportsbookTransactional) {
        HttpURLConnection connection;
        try {
            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("POST");
        } catch (IOException e) {
            throw new RuntimeException("The connection couldn't be established with url: " + url);
        }

        connection.setDoOutput(true);
        connection.setConnectTimeout(15000);
        connection.setRequestProperty("X-Application", applicationKey);
        connection.setRequestProperty("X-IP", "0.0.0.0");
        connection.setRequestProperty("Accept", "application/json");

        if (type.equals("json")) {
            connection.setRequestProperty("Content-Type", "application/json");
        } else if (type.equals("www")) {
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        }
        if (productToken != null && sportsbookTransactional && Utils.productTokenValid(productToken)) {
            connection.setRequestProperty("X-Authentication-Product", productToken);
        } else if (productToken != null && Utils.productTokenValid(productToken)) {
            connection.setRequestProperty("X-Authentication", productToken);
        }
        return connection;
    }

    public static boolean productTokenValid(String productToken) {
        Pattern productTokenPattern = Pattern.compile(("^[A-Za-z0-9/+-]+=$"));
        Matcher patternMatch = productTokenPattern.matcher(productToken);
        return patternMatch.matches();
    }
}

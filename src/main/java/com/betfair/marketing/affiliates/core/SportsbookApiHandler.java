package com.betfair.marketing.affiliates.core;

import com.betfair.marketing.affiliates.config.Settings;
import com.betfair.marketing.affiliates.util.Utils;
import org.apache.commons.io.IOUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.owasp.esapi.ESAPI;
import org.owasp.esapi.Encoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import static com.betfair.marketing.affiliates.config.PropertyNames.*;
import static com.betfair.marketing.affiliates.config.Settings.getSportsbookKey;
import static com.betfair.marketing.affiliates.util.Utils.*;

@Path("sportsbook/{brand}/{type}")
@Produces(MediaType.APPLICATION_JSON)
public class SportsbookApiHandler {
    private static final Logger LOG = LoggerFactory.getLogger(SportsbookApiHandler.class);

    private final static String LIST_EVENTS = "listEvents";
    private final static String LIST_MARKET_PRICES = "listMarketPrices";
    private final static String LIST_MARKET_CATALOGUE = "listMarketCatalogue";
    private final static String PLACE_BETS = "placeBets";
    private final static String IMPLY_BETS = "implyBets";
    private final static String GET_ACCOUNT_FUNDS = "getAccountFunds";
    private final static String GET_MARKET_PRICES_BY_EVENT = "getMarketPricesByEvent";
    private static final String INVALID_JSON_REQUEST_BODY = "INVALID_JSON_REQUEST_BODY";
    private static final String INVALID_REQUEST_PATH = "INVALID_REQUEST_PATH";
    private static final String PRODUCT_TOKEN_NOT_FOUND = "PRODUCT_TOKEN_NOT_FOUND";
    private static final String INVALID_BRAND_PATH = "INVALID_BRAND_PATH";
    private static final String INVALID_PRODUCT_TOKEN = "INVALID_PRODUCT_TOKEN";
    private static final String INVALID_API_REQUEST = "INVALID_API_REQUEST";

    private Encoder encoder = ESAPI.encoder();

    private HashMap<String, String> bodies = new HashMap<>();
    private String productToken;
    private String brand;

    public SportsbookApiHandler() {

        bodies.put(LIST_EVENTS, "{\"listEventsRequestParams\":{\"marketFilter\":{}}}");
        bodies.put(LIST_MARKET_CATALOGUE, "{\"listMarketCatalogueRequestParams\":{\"marketFilter\":{},\"maxResults\":100}}");
        bodies.put(LIST_MARKET_PRICES, "{\"listMarketPricesRequestParams\":{}}");
        bodies.put(PLACE_BETS, "{\"placeBetsRequestParams\":{\"betDefinitions\":[{\"stakePerLine\":0,\"betNumber\":1,\"betType\":\"SINGLE\",\"betLegs\":[{\"legType\":\"SIMPLE_SELECTION\",\"betRunners\":[{\"runner\":{\"marketId\":\"\",\"selectionId\":\"\"}}]}]}]}}");
        bodies.put(IMPLY_BETS, "{\"implyBetsRequestParams\":{}}");
        bodies.put(GET_ACCOUNT_FUNDS, "{}");
    }


    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public JSONObject handleRequest(
            @Context HttpServletRequest request,
            @PathParam("brand") String brandValue,
            @PathParam("type") String requestType,
            @CookieParam("productTokenBetfair") String productTokenBetfair,
            @CookieParam("productTokenPaddypower") String productTokenPaddypower) throws IOException, ParseException {


        JSONObject requestJsonObject;
        brandValue = encoder.encodeForJavaScript(brandValue);
        requestType = encoder.encodeForJavaScript(requestType);

        try {
            requestJsonObject = (JSONObject) new JSONParser().parse(new InputStreamReader(request.getInputStream()));
        } catch (IOException | ParseException e) {
            LOG.error("Invalid JSON parsed");
            return badRequest(INVALID_JSON_REQUEST_BODY);
        }

        if (!setBrandProductToken(brandValue, productTokenBetfair, productTokenPaddypower)) {
            badRequest(INVALID_PRODUCT_TOKEN);
        }
        return executeRequest(brand, requestType, requestJsonObject);


    }

    private JSONObject executeRequest(String brandValue, String requestType, JSONObject requestJsonObject) throws ParseException, IOException {
        switch (requestType) {
            case LIST_EVENTS:
                return retrieveAllEvents(requestJsonObject);
            case LIST_MARKET_CATALOGUE:
                return retrieveMarketCatalogue(requestJsonObject);
            case LIST_MARKET_PRICES:
                return retrieveMarketPrices(requestJsonObject);
            case PLACE_BETS:
                return placeBet(requestJsonObject);
            case IMPLY_BETS:
                return implyBet(requestJsonObject);
            case GET_ACCOUNT_FUNDS:
                return requestFunds(brandValue);
            case GET_MARKET_PRICES_BY_EVENT:
                return retrieveMarketPricesByEvent(requestJsonObject);
            default:
                return badRequest(INVALID_API_REQUEST);
        }
    }

    private boolean setBrandProductToken(String brandValue, String productTokenBetfair, String productTokenPaddypower) {
        if (brandValue.equals(BETFAIR) && productTokenBetfair != null && Utils.productTokenValid(productTokenBetfair)) {
            brand = brandValue;
            productToken = productTokenBetfair;
            return true;
        } else if (brandValue.equals(PADDYPOWER) && productTokenPaddypower != null && Utils.productTokenValid(productTokenPaddypower)) {
            brand = brandValue;
            productToken = productTokenPaddypower;
            return true;
        } else if (brandValue.equals(BETFAIR) || brandValue.equals(PADDYPOWER)) {
            brand = brandValue;
            return true;
        }
        return false;
    }

    private JSONObject retrieveMarketPricesByEvent(JSONObject requestJsonObject) throws IOException, ParseException {

        JSONObject marketsCatalogueResponse = retrieveMarketCatalogue(requestJsonObject);
        JSONObject marketPricesRequestObject = new JSONObject();

        JSONArray markets = (JSONArray) new JSONParser().parse(marketsCatalogueResponse.get("response").toString());
        JSONArray requestArray = new JSONArray();
        for (Object object : markets) {
            JSONObject jsonObject = (JSONObject) object;
            String marketId = jsonObject.get("marketId").toString();
            requestArray.add(marketId);
        }
        marketPricesRequestObject.put("marketIds", requestArray);
        return retrieveMarketPrices(marketPricesRequestObject);
    }


    private JSONObject retrieveAllEvents(JSONObject requestJsonObject) {
        String requestBody = bodies.get(LIST_EVENTS);
        String affiliateProductToken = getAffiliateSession(brand);
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(LIST_EVENTS, requestBody, affiliateProductToken, false);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject retrieveMarketCatalogue(JSONObject requestJsonObject) throws ParseException {
        String affiliateProductToken = getAffiliateSession(brand);
        String eventId = (String) requestJsonObject.get("eventId");
        JSONArray eventIds = new JSONArray();
        eventIds.add(eventId);
        JSONObject marketFilter = new JSONObject();
        marketFilter.put("eventIds", eventIds);
        JSONObject requestBody = (JSONObject) new JSONParser().parse(bodies.get(LIST_MARKET_CATALOGUE));
        JSONObject listMarketCatalogueRequestParams = (JSONObject) requestBody.get("listMarketCatalogueRequestParams");
        listMarketCatalogueRequestParams.put("marketFilter", marketFilter);
        requestBody.put("listMarketCatalogueRequestParams", listMarketCatalogueRequestParams);
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(LIST_MARKET_CATALOGUE, requestBody.toJSONString(), affiliateProductToken, false);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject retrieveMarketPrices(JSONObject requestJsonObject) throws IOException, ParseException {
        JSONObject requestBody = (JSONObject) new JSONParser().parse(bodies.get(LIST_MARKET_PRICES));
        JSONArray marketsIds = (JSONArray) requestJsonObject.get("marketIds");
        JSONObject listMarketPrices = new JSONObject();
        listMarketPrices.put("marketIds", marketsIds);
        requestBody.put("listMarketPricesRequestParams", listMarketPrices);

        String affiliateProductToken = getAffiliateSession(brand);
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(LIST_MARKET_PRICES, requestBody.toJSONString(), affiliateProductToken, false);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject requestFunds(String brand) throws IOException {
        String requestBody = bodies.get(GET_ACCOUNT_FUNDS);
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(GET_ACCOUNT_FUNDS, requestBody, null, true);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject implyBet(JSONObject requestJsonObject) throws IOException, ParseException {
        JSONObject requestBody = new JSONObject();
        JSONObject betLegs = new JSONObject();
        String marketId = requestJsonObject.get("marketId").toString();
        String selectionId = requestJsonObject.get("selectionId").toString();
        betLegs.put("betLegs", buildBetLegs(marketId, selectionId));
        requestBody.put("implyBetsRequestParams", betLegs);
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(IMPLY_BETS, requestBody.toJSONString(), null, true);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject placeBet(JSONObject requestJsonObject) throws IOException {
        JSONObject requestBody = new JSONObject();
        String marketId = requestJsonObject.get("marketId").toString();
        String selectionId = requestJsonObject.get("selectionId").toString();
        String stake = requestJsonObject.get("stake").toString();
        boolean useBonus = Boolean.parseBoolean(requestJsonObject.get("useBonus").toString());

        requestBody.put("placeBetsRequestParams", buildBetDefinitions(marketId, selectionId, stake, useBonus));
        Map<Integer, String> sportsbookResponse = sportsbookAPIRequest(PLACE_BETS, requestBody.toJSONString(), null, true);
        return buildResponseJson(sportsbookResponse);
    }

    private JSONObject badRequest(String type) {
        JSONObject response = new JSONObject();
        switch (type) {
            case INVALID_JSON_REQUEST_BODY:
                response.put("status", "invalid_json");
                response.put("message", "Invalid body request!");
                break;
            case INVALID_REQUEST_PATH:
                response.put("status", "invalid_request_path");
                response.put("message", "Invalid request path!");
                break;
            case PRODUCT_TOKEN_NOT_FOUND:
                response.put("status", "token_not_found");
                response.put("message", "Product token not found!!");
                break;
            case INVALID_BRAND_PATH:
                response.put("status", "invalid_brand_path");
                response.put("message", "The brand you are trying to access is not available!");
                break;
            case INVALID_PRODUCT_TOKEN:
                response.put("status", "invalid_product_token");
                response.put("message", "The productToken used is invalid!");
                break;
            case INVALID_API_REQUEST:
                response.put("status", "invalid_api_request");
                response.put("message", "Unknown error!");
                break;
            default:
                response.put("status", "broken");
                response.put("message", "Unknown error!");
                break;
        }
        return response;
    }

    private Map<Integer, String> sportsbookAPIRequest(String type, String body, String productToken, boolean transactionalOperation) {
        Map<Integer, String> result;
        String requestPath = Settings.getSportsbookEndpoint(brand) + type + '/';
        HttpURLConnection connection = createNewHttpConnection(requestPath, getSportsbookKey(brand), (productToken != null ? productToken : this.productToken), "json", transactionalOperation);
        try (OutputStream outputStream = connection.getOutputStream()) {
            outputStream.write(body.getBytes());
            result = extractResponseIfSuccess(connection);
        } catch (IOException e) {
            throw new RuntimeException("Sportsbook Request Error!");
        }
        return result;
    }

    private Map<Integer, String> extractResponseIfSuccess(HttpURLConnection connection) throws IOException {
        Map<Integer, String> result = new HashMap<>();
        if (connection.getResponseCode() == 200) {
            try (InputStream inputStream = connection.getInputStream()) {
                result.put(connection.getResponseCode(), IOUtils.toString(inputStream));
            }
        } else {
            result.put(connection.getResponseCode(), connection.getResponseMessage());
        }
        return result;
    }

    private JSONObject buildResponseJson(Map<Integer, String> sportsbookResponse) {
        JSONObject response = new JSONObject();
        if (sportsbookResponse.containsKey(200)) {
            response.put("status", "success");
            response.put("response", sportsbookResponse.get(200));
        } else {
            response.put("status", "fail");
            response.put("error", sportsbookResponse.entrySet().iterator().next().getValue());
        }
        return response;
    }

    private JSONArray buildBetLegs(String marketId, String selectionId) {
        JSONArray betLegs = new JSONArray();
        JSONObject betLeg = new JSONObject();
        JSONArray betRunners = buildBetRunners(marketId, selectionId);
        betLeg.put("legType", "SIMPLE_SELECTION");
        betLeg.put("betRunners", betRunners);
        betLegs.add(betLeg);
        return betLegs;
    }

    private JSONArray buildBetRunners(String marketId, String selectionId) {
        JSONObject runnerInformation = new JSONObject();
        runnerInformation.put("marketId", marketId);
        runnerInformation.put("selectionId", selectionId);
        JSONObject runner = new JSONObject();
        runner.put("runner", runnerInformation);
        JSONArray betRunners = new JSONArray();
        betRunners.add(runner);
        return betRunners;
    }

    private JSONObject buildBetDefinition(String marketId, String selectionId, String stake) {
        JSONObject betDefinition = new JSONObject();
        JSONArray betLegsArray = buildBetLegs(marketId, selectionId);
        betDefinition.put("stakePerLine", Float.valueOf(stake));
        betDefinition.put("betNumber", 1);
        betDefinition.put("betType", "SINGLE");
        betDefinition.put("betLegs", betLegsArray);
        return betDefinition;
    }

    private JSONObject buildBetDefinitions(String marketId, String selectionId, String stake, boolean useBonus) {
        JSONObject betDefinition = new JSONObject();
        JSONObject betDefinitionObj = buildBetDefinition(marketId, selectionId, stake);
        JSONArray betDefinitionsArray = new JSONArray();
        betDefinitionsArray.add(betDefinitionObj);
        betDefinition.put("betDefinitions", betDefinitionsArray);
        betDefinition.put("useAvailableBonus", useBonus);
        return betDefinition;
    }

    private static String getAffiliateSession(String brand) {
        String urlString = Settings.getIdentityApiLoginUrl(brand);
        HttpURLConnection connection = createNewHttpConnection(urlString, getSportsbookKey(brand), null, "www", false);
        Map<String, String> requestBody = createRequestBody(brand);
        StringJoiner params = createParamsUrl(requestBody);

        try (OutputStream outputStream = connection.getOutputStream()) {
            outputStream.write(params.toString().getBytes());
            InputStream inputStream = connection.getInputStream();
            String identityResponse = IOUtils.toString(inputStream);
            inputStream.close();

            JSONObject jsonResponse = (JSONObject) new JSONParser().parse(identityResponse);
            String affiliateProductToken = (String) jsonResponse.get(TOKEN_PARAM);

            if (Utils.productTokenValid(affiliateProductToken)) {
                return affiliateProductToken;
            } else {
                throw new IllegalStateException("Invalid affliate product token");
            }
        } catch (ParseException | IOException e) {
            LOG.error("Unable to get Affiliate Main Session");
            throw new RuntimeException("Unable to get Affiliate Main Session");
        }
    }
}


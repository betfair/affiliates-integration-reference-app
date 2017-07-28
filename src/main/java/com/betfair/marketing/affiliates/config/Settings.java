package com.betfair.marketing.affiliates.config;

import static com.betfair.marketing.affiliates.config.PropertyNames.*;
import static com.betfair.marketing.affiliates.config.PropertyHandler.getProperty;

public interface Settings {
    static String getMyAccountUrl(String brand) {
        return getProperty(brand, VIEW_MYACCOUNT);
    }

    static String getIdentityApiLoginUrl(String brand) {
        return getProperty(brand, IDENTITY_API_LOGIN);
    }

    static String getRegistrationUrl(String brand) {
        return getProperty(brand, VIEW_REGISTER);
    }

    static String getIdentityLoginViewUrl(String brand) {
        return getProperty(brand, VIEW_LOGIN);
    }

    static String getCallbackUrl(String brand) {
        return getProperty(brand, AFFILIATE_CALLBACK_PRODUCT_TOKEN);
    }

    static String getIdentityProductTokenUrl(String brand) {
        return getProperty(brand, IDENTITY_API_PRODUCT_TOKEN);
    }

    static String getAffiliateProductTokenFormUrl(String brand) {
        return getProperty(brand, AFFILIATE_FORM_PRODUCT_TOKEN);
    }

    static String getMyBetsUrl(String brand) {
        return getProperty(brand.toLowerCase(), VIEW_MYBETS);
    }

    static String getBrandOrigin(String brand) {
        return getProperty(brand, BRAND_ORIGIN);
    }

    static String getSportsbookEndpoint(String brand) {
        return getProperty(brand, SPORTSBOOK_ENDPOINT);
    }

    static String getIdentityProductName(String brand) {
        return getProperty(brand, BRAND_IDENTITY_PRODUCT);
    }

    static String getSportsbookKey(String brand) {
        return getProperty(brand, SPORTSBOOK_KEY);
    }

    static String getSportsbookUser(String brand) {
        return getProperty(brand, SPORTSBOOK_USER);
    }

    static String getSportsbookPassword(String brand) {
        return getProperty(brand, SPORTSBOOK_PASSWORD);
    }

    static String getOpenAccountUrl(String brand) {
        return getProperty(brand, OPEN_ACCOUNT);
    }

    static String getAllowedHost(String brand) {
        return getProperty(brand, ALLOWED_HOST);
    }

    static String getDomain() {
        return getProperty(DOMAIN);
    }
}

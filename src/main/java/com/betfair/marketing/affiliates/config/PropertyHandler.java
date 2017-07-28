package com.betfair.marketing.affiliates.config;

import java.io.*;
import java.util.Properties;

import static java.lang.String.format;

public class PropertyHandler {
    private static final String ENV;
    private static final String GLOBAL_CONFIGS_PROPERTIES = "global.configs.properties";

    static {
        ENV = System.getProperty("env", "prod").toLowerCase();
    }

    static String getProperty(String brand, String propertyName) {
        Properties properties = new Properties();
        String fileName = format("%s/%s.config.properties", ENV, brand);
        readPropertyFile(fileName, properties);

        return properties.getProperty(brand + "." + propertyName);
    }

    static String getProperty(String propertyName) {
        Properties properties = new Properties();
        readPropertyFile(GLOBAL_CONFIGS_PROPERTIES, properties);

        return properties.getProperty(propertyName);
    }

    private static void readPropertyFile(String fileName, Properties properties) {
        try (InputStream inputStream = PropertyHandler.class.getClassLoader().getResourceAsStream(fileName)) {
            properties.load(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Properties couldn't be read or invalid propertyName!");
        }
    }
}

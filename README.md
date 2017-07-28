# Affiliate integration test application
## Scope
The Paddy Power Betfair affiliates are provided the capability to integrate their applications with the branded Sportsbook API (for odds and betting) and the branded Customer account related applications.

## How to run
In order to run the application you must do the do the following steps
* Install maven and set it up to be availabile in the cmd/sell bin path
* Modify you hosts file, add the following line/dns entry `127.0.0.1 test.affiliate.test`
* Generate a self signed certificate to run the app on https with the following command  where you specify the absolute for java:  

    UNIX:`$JAVA_HOME/bin/keytool -genkey -alias tomcat -keyalg RSA`
    
    WINDOWS: `"%JAVA_HOME%\bin\keytool" -genkey -alias tomcat -keyalg RSA`
* When asking for password for certificate set it to: `changeit`
* Check in your user home directory if a file named `.keystore` (which represents the certificate) has been created
* Browse to the project root folder (the folder which contains the pom.xml file)
* Run mvn `mvn clean compile tomee-embedded:run -Denv=prod`. -Denv could be 'nxt' or 'prod', if not specified the application will start with 'prod' setup.
    This will start an tomcat server that will serve the application. If running on *nix systems please use sudo
* Open your browser and go to [http://test.affiliate.test/affiliate-integration](http://test.affiliate.test/affiliate-integration)

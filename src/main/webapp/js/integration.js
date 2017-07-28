integration = {
    integrationContainer: null,
    brand: {
        betfair: {
            betslipObject: null,
            selectBtn: null,
            loginBtn: null,
            registerBtn: null,
            betslipBtn: null,
            myAccountBtn: null,
            backToBetslip: null,
            headerLink: null,
            requestStatusMessage: null,
            iframe: null,
            betslip: null,
            betslipContainer: null,
            events: [],
            marketDetails: [],
            selection: {
                eventId: null,
                marketId: null,
                selectionId: null,
                oddsDisplayed: null,
                stake: null,
                useBonus: false
            },
            productToken: null,
            loggedIn: false
        },
        paddypower: {
            betslipObject: null,
            selectBtn: null,
            loginBtn: null,
            registerBtn: null,
            betslipBtn: null,
            myAccountBtn: null,
            backToBetslip: null,
            headerLink: null,
            requestStatusMessage: null,
            iframe: null,
            betslip: null,
            betslipContainer: null,
            events: [],
            marketDetails: [],
            selection: {
                eventId: null,
                marketId: null,
                selectionId: null,
                oddsDisplayed: null,
                stake: null,
                useBonus: false
            },
            productToken: null,
            loggedIn: false
        },

        /* DEFAULT : betfair */
        active: "betfair"
    },

    config: function () {

        var brands = ["betfair", "paddypower"];
        for (var i = 0; i < brands.length; i++) {
            var brand = this.capitalize(brands[i]);
            integration.brand[brands[i]].loginBtn = document.getElementById("loginBtn" + brand);
            integration.brand[brands[i]].registerBtn = document.getElementById("registerBtn" + brand);
            integration.brand[brands[i]].betslipBtn = document.getElementById("betslipBtn" + brand);
            integration.brand[brands[i]].myAccountBtn = document.getElementById("myAccountBtn" + brand);
            integration.brand[brands[i]].backToBetslip = document.getElementById("backToBetslip" + brand);
            integration.brand[brands[i]].iframe = document.getElementById("bookkeeperIframe" + brand);
            integration.brand[brands[i]].betslip = document.getElementById("betslipContainer" + brand);
            integration.brand[brands[i]].headerLink = document.getElementById("openAccount" + brand);
            integration.brand[brands[i]].betslipContainer = document.getElementById("integration" + brand);
            integration.brand[brands[i]].requestStatusMessage = document.getElementById("requestStatusMessage" + brand);

            integration.setButtonsVisibility(brand.toLowerCase(), true, true, false, false);
            integration.setBetslipFrameVisibility(brand.toLowerCase(), true, false);
        }
        integration.integrationContainer = document.getElementById("integrationContainer");
        integration.brandsSettingsRequest();
    },

    /* UTILS */
    setCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    },
    setInProgress: function () {
        console.log("In progress");
    },
    capitalize: function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
    getProductTokenCookie: function (brand) {
        return this.getCookie("productToken" + integration.capitalize(brand));
    },
    checkProductToken: function (brand) {
        var productToken = this.getProductTokenCookie(brand);
        if (productToken === null) {
            // user is not logged in
            return false;
        }
        this.productToken = productToken;
        return true;
    },
    checkProductTokenIsSet: function (brand) {
        return integration.getCookie("productToken" + this.capitalize(brand)) !== null;
    },
    /* END UTILS */



    /* ERROR HANDLER */
    errorPlacingBet: function (responseObj) {
        integration.setPlacingBetResultLabel("FAILED", responseObj);
    },
    displayError: function (type, output) {
        var brand = integration.brand.active;

        if (type === "WARNING") {
            integration.brand[brand].requestStatusMessage.className = "label label-warning placing-bet-result";
            integration.brand[brand].requestStatusMessage.innerHTML = output;
            integration.brand[brand].requestStatusMessage.style.display = "block";
        }
    },
    implyBetError: function (type) {
        var output;
        switch (type) {
            case "PRODUCT_TOKEN_MISSING":
                output = "Product Token Missing!";
                console.warn(output);
                break;
            case "INTERNAL_ERROR":
                output = "Unable To Verify Bet Options!";
                console.warn(output);
                break;
            case "IMPLY_BET_RESPONSE":
                output = "Imply bet Response Failed!";
                integration.errorOnBetting("IMPLY_BET_RESPONSE");
                console.warn(output);
                break;
            case "EVENT_SELECTION_MISSING":
                output = "Please select an event and a stake";
                console.warn("Please select an event and a stake");
                break;
            default:
                output = "Unknown error!";
                console.warn("Unknown error!");
                break;
        }

        integration.displayError("WARNING", output);

    },
    setPlacingBetResultLabel: function (status, responseObj) {
        var brand = integration.brand.active;
        if (status === "SUCCESS") {
            integration.renderBetReceipt(brand, responseObj);
            /*
             integration.brand[brand].requestStatusMessage.className = "label label-success placing-bet-result";
             integration.brand[brand].requestStatusMessage.innerHTML = "Bet placed successfully!";
             */
        } else {
            integration.brand[brand].requestStatusMessage.className = "label label-warning placing-bet-result";
            integration.brand[brand].requestStatusMessage.innerHTML = "Error in placing bet!";
        }
        integration.brand[brand].requestStatusMessage.style.display = "block";
    },
    checkImplyBetResponse: function (responseString) {
        responseJson = JSON.parse(responseString);

        if (responseJson !== null && responseJson.hasOwnProperty("resultCode") && responseJson.resultCode === "SUCCESS") {
            integration.setInProgress();
            return integration.implyBetOddsCheck(responseJson);
        } else {
            integration.implyBetError("IMPLY_BET_RESPONSE");
        }
    },
    checkPlacingBetRequest: function (response) {
        return (response.resultCode === "SUCCESS");
    },
    errorOnBetting: function (error_type) {

        switch (error_type) {
            case "UNDER_AMOUNT_TO_BET":
                console.warn("You need to place a bet of 2&#163;");
                break;
            case "IMPLY_BET_RESPONSE" :
                console.warn("Error on placing this bet");
                break;
            default:
                console.warn("Other type of error");
                break;
        }
    },
    /* ERROR HANDLER END*/



    /* BETSLIP BUTTONS */
    handleLoginButton: function () {
        var brand = integration.brand.active;
        //check if the user is logged in
        if (integration.getProductTokenCookie(brand) && !integration.brand[brand].loggedIn) {
            integration.setButtonsVisibility(brand, false, false, true, true);
            integration.updateBetslipAfterLoggedIn(brand);
        } else {
            integration.setButtonsVisibility(brand, true, true, false, false);
            integration.updateBetslipAfterLoggedIn(brand);
            if (window.checkProductTokenAfterLogin === undefined) {
                window.checkProductTokenAfterLogin = [];
            }
            window.checkProductTokenAfterLogin[brand] = setInterval(function (brand) {
                if (integration.getCookie("productToken" + integration.capitalize(brand)) !== null) {
                    integration.requestProductToken(brand);
                    integration.updateBetslipActionContainer(brand);
                    clearInterval(window.checkProductTokenAfterLogin[brand]);
                    integration.brand[brand].loggedIn = true;
                    integration.updateBetslipHeader(brand);
                    integration.setButtonsVisibility(brand, false, false, true, true);
                    integration.setBetslipFrameVisibility(brand, true, false);
                }
            }, 500, brand);
        }
        integration.brand[brand].iframe.src = config[brand].autoSubmittableForm;
        integration.setBetslipFrameVisibility(brand, false, true);
    },
    handleRegisterButton: function (event) {
        var btnId = event.target.id;
        var brandName = btnId.slice(11).toLowerCase();
        if (brandName) {
            integration.brand[brandName].iframe.src = config[brandName].registerLink;
            integration.setBetslipFrameVisibility(brandName, false, true);
            integration.displayBetslip(brandName);

            if (brandName === "betfair") {
                integration.updateBetslipLogo(true, false);
            } else if (brandName === "paddypower") {
                integration.updateBetslipLogo(false, true);
            }

            integration.brand.active = brandName;
        }
    },
    handleMyAccountButton: function () {
        var brand = integration.brand.active;
        if (integration.getCookie("productToken" + integration.capitalize(brand))) {
            integration.brand[brand].loggedIn = true;
            integration.setBetslipFrameVisibility(brand, false, true);
        } else {
            integration.setButtonsVisibility(brand, true, true, false, false);
            integration.brand[brand].loggedIn = false;
        }
    },
    handleBetslipButton: function () {
        var brand = integration.brand.active;
        integration.setBetslipFrameVisibility(brand, true, false);
    },

    toggleMobileVersion: function (type) {
        if (integration.integrationContainer.style.display === "block" && type !== "onetime") {
            integration.integrationContainer.style.display = "none";
        } else {
            integration.integrationContainer.style.display = "block";
        }
    },

    closeBetslipMobile: function (event) {
        if (event.target.id === "closeMobileBetfair") {
            integration.brand.betfair.betslipContainer.style.display = (integration.brand.betfair.betslipContainer.style.display === "block" ? "none" : "block");
            event.target.innerHTML = ( integration.brand.betfair.betslipContainer.style.display = (integration.brand.betfair.betslipContainer.style.display === "block" ? "Hide Betslip" : "Open Betslip"));
        } else if (event.target.id === "closeMobilePaddypower") {
            integration.brand.paddypower.betslipContainer.style.display = (integration.brand.paddypower.betslipContainer.style.display === "block" ? "none" : "block");
            event.target.innerHTML = ( integration.brand.paddypower.betslipContainer.style.display = (integration.brand.paddypower.betslipContainer.style.display === "block" ? "Hide Betslip" : "Open Betslip"));
        }
    },

    betslipDisplayOnMobile: function () {
        if (integration.brand[brand].betslipContainer.style.display === "none" && type !== "onetime") {
            integration.brand[brand].betslipContainer.style.display = "block";
        } else if (type === "onetime") {
            integration.brand[brand].betslipContainer.style.display = "block";
        } else {
            integration.brand[brand].betslipContainer.style.display = "none";
        }

    },

    updateUseBonusInSelection: function (event) {
        var brand = event.target.value.split("-")[2].toLowerCase();
        var checked = event.target.checked;
        if ((brand === 'betfair' || brand === 'paddypower') && checked !== undefined) {
            integration.brand[brand].selection.useBonus = checked;
        }
    },
    /* BETSLIP BUTTONS END*/


    /* AJAX REQUEST */
    implyBetRequest: function () {

        var brand = integration.brand.active;
        if (!integration.checkProductTokenIsSet(brand)) {
            integration.implyBetError("PRODUCT_TOKEN_MISSING");
            return null;
        }

        var requestData = {
            "marketId": integration.brand[brand].selection.marketId,
            "selectionId": integration.brand[brand].selection.selectionId,
            "stake": integration.brand[brand].selection.stake,
            "useBonus": integration.brand[brand].selection.useBonus.toString()
        };
        var responseData = null;
        if (integration.checkSelectionIsSet()) {
            $.ajax({
                url: config.sportsbook.base + brand + "/" + config.sportsbook.type.implyBets + "/",
                method: 'POST',
                data: JSON.stringify(requestData),
                success: function (data) {
                    responseData = data;
                    if (responseData.status === "success") {
                        if (integration.checkImplyBetResponse(responseData.response)) {
                            integration.placeBetRequest();
                        } else {
                            integration.implyBetError("INTERNAL_ERROR");
                        }
                    }
                }
            });
        } else {
            integration.implyBetError("EVENT_SELECTION_MISSING");
        }

    },
    placeBetRequest: function () {
        var brand = integration.brand.active;
        var requestData = {
            "marketId": integration.brand[brand].selection.marketId,
            "selectionId": integration.brand[brand].selection.selectionId,
            "stake": integration.brand[brand].selection.stake,
            "useBonus": integration.brand[brand].selection.useBonus.toString()
        };
        var responseData = null;
        $.ajax({
            url: config.sportsbook.base + brand + "/" + config.sportsbook.type.placeBets,
            method: 'POST',
            data: JSON.stringify(requestData),
            success: function (data) {
                responseData = data;
                if (responseData.status === "success") {
                    var responseObj = JSON.parse(responseData.response);
                    if (integration.checkPlacingBetRequest(responseObj)) {
                        integration.successPlacingBet(responseObj);
                    } else {
                        integration.errorPlacingBet(responseObj);
                    }
                } else {
                    integration.errorPlacingBet(responseObj);
                }
            }
        });
    },
    listEventsRequest: function (brand) {
        var requestData = {
            brand: brand
        };
        $.ajax({
            url: config.sportsbook.base + brand + '/' + config.sportsbook.type.listEvents,
            data: JSON.stringify(requestData),
            method: 'POST',
            success: function (data) {
                if (data.status === "success") {
                    var eventsArray;
                    eventsArray = JSON.parse(data.response);
                    integration.saveListOfEvents(eventsArray);
                }
            }
        });
    },
    accountFundsRequest: function (brand) {
        var requestData = {
            brand: "betfair"
        };
        var responseData = null;
        $.ajax({
            url: config.sportsbook.base + brand + "/" + config.sportsbook.type.getAccountFunds,
            method: 'POST',
            data: JSON.stringify(requestData),
            success: function (data) {
                responseData = data;
                if (responseData.status === "success") {
                    integration.setBetslipHeader(brand, responseData.response);
                }
            }
        });
    },
    eventMarketsRequest: function (event) {
        if ($(this).hasClass("markets-created")) {
            var list = $(this).parent().find(".list-group");

            if (list.is(":visible")) {
                list.hide();
            } else {
                list.show();
            }
        } else {
            var requestBody = {
                "eventId": event.target.value
            };
            $.ajax({
                url: config.sportsbook.base + integration.brand.active + '/' + config.sportsbook.type.getMarketPricesByEvent,
                method: 'POST',
                data: JSON.stringify(requestBody),
                success: function (data) {
                    // create markets for the event
                    integration.updateMarketsDetailsData(data, integration.brand.active);
                    integration.renderEventMarkets(event.target.parentNode, data.response, event.target.value);
                },
                fail: function (data) {
                    integration.renderEventMarkets(event.target.parentNode, data.response, event.target.value);
                }
            });
            $(this).addClass("markets-created");
        }
    },
    getLogoutOrigin: function (event) {
        if (event.origin === config.betfair.origin) {
            return "betfair";
        } else if (event.origin === config.paddypower.origin) {
            return "paddypower";
        } else {
            console.warn("Other post message");
            return null;
        }
    },
    logoutPostMessageListener: function (event) {
        var eventOriginBrand = integration.getLogoutOrigin(event.origin);
        if ((eventOriginBrand !== null) && event.data.hasOwnProperty("logoutStatus") && event.data.logoutStatus) {
            integration.brand[eventOriginBrand] = false;
            integration.setCookie("productToken" + integration.capitalize(eventOriginBrand), null, -1);
            integration.setCookie("productChecked" + integration.capitalize(eventOriginBrand), null, -1);
            integration.setDefaultBetSlip(eventOriginBrand);
            integration.setBetslipDefaultHeader(eventOriginBrand);
        } else {
            console.warn("Other post message");
            return null;
        }
    },
    brandsSettingsRequest: function () {
        $.ajax({
            url: config.settingsUrl,
            method: 'GET',
            data: {},
            success: function (data) {
                integration.setBrandInformation(data);
            }
        });
    },
    requestProductToken: function (brand) {
        var requestBody = {
            product: "foe",
            url: config[brand].identityCallback,
            redirectMethod: "POST"
        };

        $.ajax({
            url: config[brand].productTokenLink + "/",
            method: 'POST',
            data: JSON.stringify(requestBody),
            success: function (data) {
                clearInterval(window.checkProductTokenAfterLogin);
            },
            fail: function (data) {
            }
        });
    },

    /* AJAX REQUEST END*/



    /* BETSLIP EVENTS */
    updateBetslipAfterLoggedIn: function (brand) {
        if (integration.getCookie("productToken" + this.capitalize(brand))) {
            integration.updateBetslipActionContainer(brand);
            clearInterval(window.checkProductTokenAfterLogin);
            integration.brand[brand].loggedIn = true;
            integration.updateBetslipHeader(brand);
            integration.setButtonsVisibility(brand, false, false, true, true);
            integration.setBetslipFrameVisibility(brand, true, false);
        }
    },
    setButtonsVisibility: function (brand, login, register, betslip, myaccount) {
        integration.brand[brand].betslipBtn.style.display = (!login ? "inline-block" : "none");
        integration.brand[brand].myAccountBtn.style.display = (!register ? "inline-block" : "none");
        integration.brand[brand].registerBtn.style.display = (!betslip ? "inline-block" : "none");
        integration.brand[brand].loginBtn.style.display = (!myaccount ? "inline-block" : "none");
    },
    setBetslipFrameVisibility: function (brand, betslip, iframe) {
        integration.brand[brand].iframe.style.display = (!betslip ? "block" : "none" );
        integration.brand[brand].betslip.style.display = (!iframe ? "block" : "none");
        integration.brand[brand].backToBetslip.style.display = (iframe ? "block" : "none");
    },
    setDefaultBetSlip: function (brand) {
        integration.setButtonsVisibility(brand, true, true, false, false);
        integration.setBetslipFrameVisibility(brand, true, false);
        integration.brand[brand].iframe.src = integration.brand[brand].url.autoSubmittableForm;
    },
    updateBetslipActionContainer: function (brand) {
        var productToken = integration.getCookie("productToken" + integration.capitalize(brand));
        // logged in
        if (integration.brand[brand].loggedIn && productToken) {
            integration.setButtonsVisibility(brand, false, false, true, true);
            return true;
        } else {
            integration.setButtonsVisibility(brand, true, true, false, false);
        }
        return false;
    },
    setBetslipHeader: function (brand, data) {

        brand = (brand !== null) ? brand : integration.brand.active;

        var html = "<b>Main:";
        var headerOpenAccount = document.getElementById("openAccount" + this.capitalize(brand));
        var headerAccountBalance = document.getElementById("accountBalance" + this.capitalize(brand));

        try {
            var responseObj = JSON.parse(data);
        } catch (e) {
            console.warn("Error in parsing the response json");
        }

        if (responseObj !== null && responseObj.hasOwnProperty("mainWalletAmount")) {
            html += "<span>" + "<b>" + (responseObj.currencyCode === "GBP" ? "	&#163;" : responseObj.currencyCode ) + "</b> " + responseObj.mainWalletAmount + "</span></b><br/><b>Bonus: <span>&#163;" + responseObj.bonusDetails.bonusAmount + "</span></b>";
        } else {
            html += "<p>Unavailable</p>";
            console.warn("Sportsbook API doesn't support request with productToken at the moment.");
        }
        headerOpenAccount.style.display = "none";
        headerAccountBalance.style.display = "inline-block";
        headerAccountBalance.innerHTML = html;

    },
    setBetslipDefaultHeader: function (brand) {
        var headerOpenAccount = document.getElementById("openAccount" + this.capitalize(brand));
        var headerAccountBalance = document.getElementById("accountBalance" + this.capitalize(brand));
        headerOpenAccount.style.display = "block";
        headerAccountBalance.innerHTML = "";
    },
    updateBetslipHeader: function (brand) {
        if (integration.brand[brand].loggedIn) {
            integration.accountFundsRequest(brand);
        } else {
            console.log("User not logged in");
        }
    },
    updateBetslipLogo: function (betfair, paddypower) {

        var betfairLogo = document.getElementById("betslip-selected-betfair");
        var paddypowerLogo = document.getElementById("betslip-selected-paddypower");

        if (betfair) {
            betfairLogo.style.backgroundSize = "15px";
            paddypowerLogo.style.backgroundSize = "0px";
        }
        if (paddypower) {
            betfairLogo.style.backgroundSize = "0";
            paddypowerLogo.style.backgroundSize = "15px";
        }
    },
    updateBetslipBettingInformation: function (brand, value) {

        var information = value.split("_");

        if (information.length === 4) {
            // continue
            var eventId = information[0];
            var marketId = information[1];
            var selectionId = information[2];
            var decimalOdd = information[3];

            integration.setSelection(brand, eventId, marketId, selectionId, null, decimalOdd);
            // get market with id
            var market = integration.getMarketDetails(brand, marketId);
            if (market !== null) {
                //get event name
                var eventName = integration.getEventName(brand, eventId);
                var brandCapitalize = integration.capitalize(brand);
                if (eventName) {
                    document.getElementById("competitionNameValue" + brandCapitalize).innerHTML = eventName;
                    document.getElementById("competitionBetType" + brandCapitalize).innerHTML = market.marketName;
                    var runnerName = integration.getRunnerDetails(market, selectionId);
                    if (runnerName) {
                        document.getElementById("runnerName" + brandCapitalize).innerHTML = "Odds:" + "<input type='button' id='oddsOfBet" + brandCapitalize + "' disabled class='btn btn-danger' value=\"" + decimalOdd + "\">" + "<b>" + runnerName + "</b>";
                    }
                }
            }
        } else {
            console.log("Something went wrong in the updateBetslipBettingInformation");
        }
        return true;
    },
    updatePotentialWin: function (event) {
        // when the amount change update the winning amount
        var brand = integration.brand.active;
        var brandCapitalize = integration.capitalize(brand);
        var amount = event.target.value;

        var odds = document.getElementById("oddsOfBet" + brandCapitalize).value;
        var displayWinContainer = document.getElementById("amountToWin" + brandCapitalize);
        var amountToWin = amount * odds;
        integration.brand[brand].selection.stake = Number(amount);

        displayWinContainer.innerHTML = !isNaN(amountToWin) ? "&#163; " + amountToWin.toFixed(2) : "";
        return amountToWin;
    },
    displayBetslip: function (brandValue) {
        if (integration.brand.active !== brandValue) {
            integration.brand[brandValue].betslipContainer.style.display = "block";
            integration.brand[integration.brand.active].betslipContainer.style.display = "none";
        }
    },
    updateBetslipBettingOption: function (event) {
        var value = event.target.value;
        var brand = integration.brand.active;

        integration.updateBetslipBettingInformation(brand, value);
        integration.toggleMobileVersion("onetime");
        integration.setBetslipFrameVisibility(brand, true, false);
    },

    betslipBrandSelectionChange: function (event) {

        var targetId = event.target.id;

        if (targetId === "brand-selected-betfair" || targetId === "betslip-selected-betfair") {
            var pp = document.getElementById("brand-selected-paddypower");
            event.target.disabled = true;
            pp.disabled = false;
            integration.displayBetslip('betfair');
            integration.setActiveBrand("betfair");
            try {
                integration.listEventsRequest("betfair");
            } catch (e) {
                console.warn("Error getting events from sportsbook");
            }
            integration.updateBetslipLogo(true, false);
        }
        else if (targetId === "brand-selected-paddypower" || targetId === "betslip-selected-paddypower") {
            var bf = document.getElementById("brand-selected-betfair");
            bf.disabled = false;
            event.target.disabled = true;
            integration.displayBetslip('paddypower');
            integration.setActiveBrand("paddypower");
            try {
                integration.listEventsRequest("paddypower");
            } catch (e) {
                console.warn("Error getting events from sportsbook");
            }
            integration.updateBetslipLogo(false, true);
        } else {
            return null;
        }
    },
    successPlacingBet: function (responseObj) {
        integration.updateBetslipHeader(integration.brand.active);
        integration.setPlacingBetResultLabel("SUCCESS", responseObj);
    },

    /* BETSLIP EVENTS END*/



    /* INTEGRATION STORED DATA */
    checkSelectionIsSet: function () {
        var brand = integration.brand.active;
        return !!(integration.brand[brand].selection.marketId && integration.brand[brand].selection.selectionId && integration.brand[brand].selection.stake);
    },
    setActiveBrand: function (brand) {
        integration.brand.active = (brand === "betfair" || brand === "paddypower") ? brand : integration.brand.active;
    },
    getEventName: function (brand, eventId) {
        for (var i = 0; i < integration.brand[brand].events.length; i++) {
            if (eventId === integration.brand[brand].events[i].event.id) {
                return integration.brand[brand].events[i].event.name;
            }
        }
        return null;
    },
    getMarketDetails: function (brand, marketId) {
        for (var i = 0; i <= integration.brand[brand].marketDetails.length; i++) {
            if (integration.brand[brand].marketDetails[i].marketId === marketId) {
                return integration.brand[brand].marketDetails[i];
            }
        }
        return null;
    },
    getRunnerDetails: function (market, selectionId) {
        var runners = market.runnerDetails;
        for (var i = 0; i < runners.length; i++) {
            if (Number(runners[i].selectionId) === Number(selectionId)) {
                return runners[i].selectionName;
            }
        }
        return null;
    },
    setSelection: function (brand, eventId, marketId, selectionId, stake, oddsDisplayed) {
        // brand = (brand !== null) ? brand : integration.brand.active;
        integration.brand[brand].selection.eventId = eventId ? eventId : integration.brand[brand].selection.eventId;
        integration.brand[brand].selection.brand = brand ? brand : integration.brand[brand].selection.brand;
        integration.brand[brand].selection.marketId = marketId ? marketId : integration.brand[brand].selection.marketId;
        integration.brand[brand].selection.selectionId = selectionId ? selectionId : integration.brand[brand].selection.selectionId;
        integration.brand[brand].selection.stake = stake ? Number(stake) : integration.brand[brand].selection.stake;
        integration.brand[brand].selection.oddsDisplayed = oddsDisplayed ? Number(oddsDisplayed) : integration.brand[brand].selection.oddsDisplayed;
    },
    implyBetOddsCheck: function (implyBetObj) {
        if (implyBetObj.legFailures.length === 0) {
            if (implyBetObj.runnerFailures.length === 0) {

                var responseOdds = implyBetObj.winRunnerOdds[0].odds.decimalDisplayOdds.decimalOdds;
                var responseMarketId = implyBetObj.winRunnerOdds[0].runner.marketId;
                var responseSelectionId = implyBetObj.winRunnerOdds[0].runner.selectionId;

                return (Number(responseOdds) === Number(integration.brand[integration.brand.active].selection.oddsDisplayed) &&
                    String(responseMarketId) === String(integration.brand[integration.brand.active].selection.marketId) &&
                    Number(responseSelectionId) === Number(integration.brand[integration.brand.active].selection.selectionId));
            } else {
                //Runners Legs Fail because runners is suspended or whatever
                return false;
            }
        }
        return false;
    },
    saveListOfEvents: function (eventsArray) {
        if (eventsArray !== null && eventsArray.length) {
            integration.brand[integration.brand.active].events = eventsArray;
            integration.renderEventsList(eventsArray);
        }
    },
    checkMarketIsNotSet: function (marketIdToFind, brand) {
        for (var i = 0; i < integration.brand[brand].marketDetails.length; i++) {
            if (integration.brand[brand].marketDetails[i].hasOwnProperty("marketId") && integration.brand[brand].marketDetails[i].marketId === marketIdToFind) {
                return false;
            }
        }
        return true;
    },
    updateMarketsDetailsData: function (data, brand) {
        if (typeof data !== 'undefined' && data.hasOwnProperty("response") && brand.length) {
            var responseObj = JSON.parse(data.response);
            if (integration.brand[brand].marketDetails.length > 0 || integration.brand[brand].marketDetails !== 'undefined') {
                for (var i = 0; i < responseObj.marketDetails.length; i++) {
                    if (this.checkMarketIsNotSet(responseObj.marketDetails[i].marketId, brand)) {
                        integration.brand[brand].marketDetails.push(responseObj.marketDetails[i]);
                    }
                }
            } else {
                integration.brand[brand].marketDetails = responseObj;
            }
            return this.marketDetails;
        }
    },
    setBrandInformation: function (responseObject) {
        if (responseObject !== null && responseObject.hasOwnProperty("settings")) {
            //update config file
            config.betfair = responseObject.settings.betfair;
            config.paddypower = responseObject.settings.paddypower;

            integration.setOpenAccountUrl();
        }

    },

    setOpenAccountUrl: function () {
        integration.brand.betfair.headerLink.href = config.betfair.openAccountLink;
        integration.brand.paddypower.headerLink.href = config.paddypower.openAccountLink;
    },
    /* INTEGRATION STORED DATA END*/



    /* DOM UPDATES*/
    renderRunnerOptions: function (marketDetails, marketId, eventId) {
        var htmlRender = "<ul class=\"list-group\">" + "<li class=\"list-group-item list-group-item-success\">" + marketDetails.marketName + "</li>";
        var elems = "";
        marketDetails.runnerDetails.forEach(function (elem) {
            if (elem.hasOwnProperty('winRunnerOdds') && elem.winRunnerOdds.hasOwnProperty('decimal')) {
                elems += "<li class=\"list-group-item\"><button class=\"btn event-market-betting-option left\" value=\"" + eventId + "_" +
                    marketId + "_" + elem.selectionId + "_" + elem.winRunnerOdds.decimal.toFixed(2) + "\">" + elem.selectionName + "</button>" +
                    "<b class=\"right\">" + elem.winRunnerOdds.decimal.toFixed(2) + "</b>" +
                    "</li>";
            }
        });
        if (elems) {
            htmlRender += elems + "</ul>";
            return htmlRender;
        }
        return false;
    },
    renderEventMarkets: function (parent, data, eventId) {
        var responseObj = JSON.parse(data);

        // for every market we create a betting obj
        if (responseObj.hasOwnProperty('marketDetails') && responseObj.marketDetails.length > 0) {
            var markets = responseObj.marketDetails;
            if (markets) {
                markets.forEach(function (elem) {
                    // if market is open
                    if (elem.marketStatus === "OPEN") {
                        //get runners name and odds
                        var content = integration.renderRunnerOptions(elem, elem.marketId, eventId);
                        if (content !== false) {
                            parent.innerHTML += content;
                        }
                    }
                });
            }
        } else {
            var btn = parent.getElementsByClassName("open-event-markets").item(0);
            btn.innerHTML = "Event not open for betting!";
            btn.disabled = true;
        }
    },
    renderEventsList: function () {
        var eventArray = integration.brand[integration.brand.active].events;
        var eventList = $(".eventsList");
        eventArray.forEach(function (elem) {
            var event = "<li class=\"event\">" +
                "<b>" + elem.event.name + "</b>" +
                "<button value=\"" + elem.event.id + "\" class=\"btn open-event-markets\">Bet on this event</button>" +
                "</li>";
            eventList.append(event);
        });
    },

    getBetNames: function (brand, marketId, selectionId) {
        var response = {};
        for (var i = 0; i < integration.brand[brand].marketDetails.length; i++) {
            if (integration.brand[brand].marketDetails[i].marketId === marketId) {
                for (var j = 0; j < integration.brand[brand].marketDetails[i].runnerDetails.length; j++) {
                    if (Number(integration.brand[brand].marketDetails[i].runnerDetails[j].selectionId) === Number(selectionId)) {
                        response.marketName = integration.brand[brand].marketDetails[i].marketName;
                        response.selectionName = integration.brand[brand].marketDetails[i].runnerDetails[j].selectionName;
                        return response;
                    }
                }
            }
        }
        return undefined;
    },


    createBetReceiptList: function () {

    },

    renderBetReceipt: function (brand, responseData) {
        if (responseData !== null && responseData.hasOwnProperty("resultCode") && responseData.resultCode === "SUCCESS") {
            var betInformation = responseData.result[0];
            var marketId = betInformation.legs[0].betLeg.betRunners[0].runner.marketId;
            var selectionId = betInformation.legs[0].betLeg.betRunners[0].runner.selectionId;
            var eventName = integration.getEventName(brand, integration.brand[brand].selection.eventId);
            var betDetails = integration.getBetNames(brand, marketId, selectionId);
            var betPlacedTime = new Date(betInformation.betPlacedTime);
            var brandCapitalize = integration.capitalize(brand);
            var receiptContainer = document.getElementById("receiptContainer" + brandCapitalize);
            /*Bet Receipt DOM Elements*/

            var brReceiptTitleId = document.getElementById("brReceiptTitleId" + brandCapitalize).innerText = betInformation.betId;
            var brEventMarket = document.getElementById("brEventMarketTitle" + brandCapitalize).innerText = eventName + ":" + betDetails.marketName;
            var brEventMarketTitleBet = document.getElementById("brEventMarketTitleBet" + brandCapitalize).innerText = "£" + betInformation.wallets[0].amount;
            var brSelectionContainer = document.getElementById("brSelectionContainer" + brandCapitalize).innerText = betDetails.selectionName;
            var brSelectionContainerOdds = document.getElementById("brSelectionContainerOdds" + brandCapitalize).innerText = betInformation.legs[0].winOdds.trueOdds.decimalOdds.decimalOdds;
            var brReceiptId = document.getElementById("brReceiptId" + brandCapitalize).innerText = betInformation.betReceiptId;
            var brReceiptBetPlacedTime = document.getElementById("brReceiptBetPlacedTime" + brandCapitalize).innerText = betPlacedTime.toDateString() + " " + betPlacedTime.getHours() + ":" + betPlacedTime.getMinutes();
            var brBetType = document.getElementById("brBetType" + brandCapitalize).innerText = "Single bet - £" + betInformation.wallets[0].amount;
            var brTotalStake = document.getElementById("brTotalStake" + brandCapitalize).innerText = "£ " + betInformation.totalStake;
            var brBonusStake = document.getElementById("brBonusStake" + brandCapitalize).innerText = "(Bonus:£" + betInformation.wallets[0].amount + " )";
            var brEstimatedReturns = document.getElementById("brEstimatedReturns" + brandCapitalize).innerText = "£" + betInformation.totalPotentialWin;

            receiptContainer.style.display = "block";
        }
    },

    closeReceipt: function (event) {
        var brand = event.target.value;
        var containerId = "receiptContainer" + integration.capitalize(brand);
        var betReceiptContainer = document.getElementById(containerId);
        betReceiptContainer.style.display = 'none';
    },

    openReceiptInMyBets: function (event) {
        var brandName = event.target.value;
        integration.brand[brandName].iframe.src = config[brandName].myBetsLink;
        integration.closeReceipt(event);
        integration.setBetslipFrameVisibility(brandName, false, true);
    }
    /* DOM UPDATES*/
};
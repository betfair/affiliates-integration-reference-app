$(document).ready(
    function () {

        var integrationContainer = document.getElementById("integrationContainer");
        var integrationEventList = document.getElementById("integrationEventList");
        integration.config();

        $(integrationEventList).on("click", ".open-event-markets", integration.eventMarketsRequest);

        $(integrationEventList).on("click", ".event-market-betting-option", integration.updateBetslipBettingOption);

        $(integrationContainer).on("input", ".amount-to-bet", integration.updatePotentialWin);

        $(integrationContainer).on("click", ".place-bet", integration.implyBetRequest);

        $(integrationContainer).on("click", ".register-btn", integration.handleRegisterButton);

        $(integrationContainer).on("click", ".login-btn", integration.handleLoginButton);

        $(integrationContainer).on("click", ".my-account-btn", integration.handleMyAccountButton);

        $(integrationContainer).on("click", ".back-to-betslip, .betslip-btn", integration.handleBetslipButton);

        $(integrationContainer).on("click", ".betslip-close", integration.closeBetslipMobile);

        $(integrationContainer).on("change", ".use-bonus-checkbox", integration.updateUseBonusInSelection);

        $(document).on("click", "#toggle-mobile-view, #closeBetslip", integration.toggleMobileVersion);

        $(document).on("click", ".receipt-close", integration.closeReceipt);

        $(document).on("click", ".receipt-open-my-bet", integration.openReceiptInMyBets);

        $(document).on("click", ".select-brand", integration.betslipBrandSelectionChange);

        window.addEventListener("message", integration.logoutPostMessageListener, false);

    }); // end document.on.ready
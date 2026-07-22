(function installCheckoutReadinessGuard() {
  "use strict";

  if (window.__gaietyCheckoutReadinessGuardInstalled) return;
  window.__gaietyCheckoutReadinessGuardInstalled = true;

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;

      var button = target.closest("[data-offer-button]");
      if (!button || button.dataset.checkoutGuardPassed === "1") return;

      var bridge = window.GaietyTracking;
      if (!bridge || typeof bridge.ready !== "function") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      button.disabled = true;

      Promise.resolve(bridge.ready())
        .then(function () {
          button.dataset.checkoutGuardPassed = "1";
          button.disabled = false;
          button.click();
        })
        .catch(function () {
          button.dataset.checkoutGuardPassed = "1";
          button.disabled = false;
          button.click();
        });
    },
    true,
  );
})();

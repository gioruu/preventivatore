(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  global.formDevUtils = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const DEFAULT_DEV_FORM_VALUES = Object.freeze({
    contractTypeValue: "transitorio",
    duration: 12,
    rent: 1200,
    condoFees: 150,
    address: "Via Roma 15, Milano"
  });

  function normalizeInitialStep(step, maxStep = 4) {
    const normalizedStep = Number(step);

    return Number.isInteger(normalizedStep) && normalizedStep >= 1 && normalizedStep <= maxStep
      ? normalizedStep
      : 1;
  }

  function getDevelopmentBootstrap(initialStep) {
    const step = normalizeInitialStep(initialStep);

    return {
      step,
      formValues: step > 1 ? { ...DEFAULT_DEV_FORM_VALUES } : null,
      selectedPlan: "full",
      selectedPayment: step === 4 ? "single" : null
    };
  }

  return {
    DEFAULT_DEV_FORM_VALUES,
    getDevelopmentBootstrap,
    normalizeInitialStep
  };
});

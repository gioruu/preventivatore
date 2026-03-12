const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CONTRACT_CATEGORIES,
  CONTRACT_TYPES,
  calculateQuote,
  getContractCategory,
  getContractTypesByCategory,
  getDurationLabel,
  getDurationOptions,
  getRecommendation,
  requiresDurationSelection,
  resolveDuration
} = require("./quote-logic.js");
const {
  DEFAULT_DEV_FORM_VALUES,
  getDevelopmentBootstrap,
  normalizeInitialStep
} = require("./form-dev-utils.js");

test("exposes the contract types derived from the pricing sheet", () => {
  assert.deepEqual(
    CONTRACT_CATEGORIES,
    [
      { value: "abitativo", label: "Abitativo" },
      { value: "non-abitativo", label: "Non abitativo" }
    ]
  );
  assert.deepEqual(
    CONTRACT_TYPES.map(({ label }) => label),
    [
      "Abitativo 4+4",
      "Abitativo concordato",
      "Studenti",
      "Transitorio",
      "Commerciale",
      "Altri non abitativi"
    ]
  );
});

test("groups contract types behind the new macro categories", () => {
  assert.deepEqual(
    getContractTypesByCategory("abitativo").map(({ value }) => value),
    ["abitativo", "abitativo-concordato", "studenti", "transitorio"]
  );
  assert.deepEqual(
    getContractTypesByCategory("non-abitativo").map(({ value }) => value),
    ["commerciale", "non-abitativo"]
  );
  assert.equal(getContractCategory("commerciale"), "non-abitativo");
  assert.equal(getContractCategory("studenti"), "abitativo");
});

test("supports month-by-month durations for transitorio contracts", () => {
  const quote = calculateQuote({
    plan: "start",
    payment: "monthly",
    contractTypeValue: "transitorio",
    duration: 18,
    rent: 900,
    condoFees: 45
  });

  assert.equal(quote.duration, 18);
  assert.equal(quote.protectedAmount, 945);
  assert.equal(quote.recurringMonthlyFee, 47.25);
  assert.equal(quote.totalContractCost, 850.5);
  assert.equal(quote.recommendation.recommendedPayment, "monthly");
});

test("supports studenti durations up to 36 months", () => {
  const options = getDurationOptions(CONTRACT_TYPES[2]);

  assert.equal(options[0].label, "6 mesi");
  assert.equal(options.at(-1).label, "36 mesi");
  assert.equal(resolveDuration("studenti", 36), 36);
});

test("falls back to the default variable duration when none is provided", () => {
  assert.equal(resolveDuration("studenti"), 12);
});

test("uses fixed durations for abitativo contracts", () => {
  const quote = calculateQuote({
    plan: "start",
    payment: "single",
    contractTypeValue: "abitativo",
    rent: 300,
    condoFees: 60
  });

  assert.equal(quote.duration, 48);
  assert.equal(quote.activationFee, 450);
  assert.equal(quote.totalContractCost, 450);
  assert.equal(quote.recommendation.recommendedPayment, "single");
});

test("applies the full plan surcharge only to soluzione unica", () => {
  const singleQuote = calculateQuote({
    plan: "full",
    payment: "single",
    contractTypeValue: "abitativo-concordato",
    duration: 60,
    rent: 700,
    condoFees: 150
  });
  const monthlyQuote = calculateQuote({
    plan: "full",
    payment: "monthly",
    contractTypeValue: "abitativo-concordato",
    duration: 60,
    rent: 700,
    condoFees: 150
  });

  assert.equal(singleQuote.activationFee, 850);
  assert.equal(singleQuote.recurringMonthlyFee, 10);
  assert.equal(singleQuote.totalContractCost, 1450);

  assert.equal(monthlyQuote.activationFee, 0);
  assert.equal(monthlyQuote.recurringMonthlyFee, 42.5);
  assert.equal(monthlyQuote.totalContractCost, 2550);
});

test("marks commerciale and non abitativo quotes as VAT excluded", () => {
  const commercialQuote = calculateQuote({
    plan: "start",
    payment: "single",
    contractTypeValue: "commerciale",
    rent: 3000,
    condoFees: 300
  });
  const nonResidentialQuote = calculateQuote({
    plan: "start",
    payment: "monthly",
    contractTypeValue: "non-abitativo",
    duration: 24,
    rent: 300,
    condoFees: 25
  });

  assert.equal(commercialQuote.vatExcluded, true);
  assert.equal(nonResidentialQuote.vatExcluded, true);
});

test("exposes the expected labels for variable duration selectors", () => {
  assert.equal(getDurationLabel("non-abitativo", 12), "1 anno");
  assert.equal(getDurationLabel("non-abitativo", 72), "6 anni");
  assert.equal(getDurationLabel("abitativo-concordato", 48), "4+2");
  assert.equal(getDurationLabel("commerciale", 72), "6+6");
});

test("flags only variable contracts as requiring an explicit duration choice", () => {
  assert.equal(requiresDurationSelection("abitativo"), false);
  assert.equal(requiresDurationSelection("commerciale"), false);
  assert.equal(requiresDurationSelection("transitorio"), true);
  assert.equal(requiresDurationSelection("studenti"), true);
  assert.equal(requiresDurationSelection("abitativo-concordato"), true);
});

test("computes the cheaper payment option for the selected plan", () => {
  const startRecommendation = getRecommendation({
    plan: "start",
    protectedAmount: 556,
    duration: 6
  });
  const fullRecommendation = getRecommendation({
    plan: "full",
    protectedAmount: 3300,
    duration: 72
  });

  assert.equal(startRecommendation.recommendedPayment, "monthly");
  assert.equal(startRecommendation.savings, 382);
  assert.equal(fullRecommendation.recommendedPayment, "single");
  assert.equal(fullRecommendation.savings, 7860);
});

test("normalizes invalid development start steps to the first step", () => {
  assert.equal(normalizeInitialStep(0), 1);
  assert.equal(normalizeInitialStep("3"), 3);
  assert.equal(normalizeInitialStep(9), 1);
});

test("seeds form data only when starting after the first step", () => {
  assert.equal(getDevelopmentBootstrap(1).formValues, null);
  assert.deepEqual(getDevelopmentBootstrap(3).formValues, DEFAULT_DEV_FORM_VALUES);
});

test("keeps the plan unselected until the comparison step", () => {
  assert.equal(getDevelopmentBootstrap(1).selectedPlan, null);
  assert.equal(getDevelopmentBootstrap(2).selectedPlan, null);
  assert.equal(getDevelopmentBootstrap(3).selectedPlan, "full");
});

test("preselects a payment only when jumping directly to the summary step", () => {
  assert.equal(getDevelopmentBootstrap(3).selectedPayment, null);
  assert.equal(getDevelopmentBootstrap(4).selectedPayment, "monthly");
});

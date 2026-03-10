const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CONTRACT_TYPES,
  calculateQuote,
  getRecommendation,
  resolveDuration
} = require("./quote-logic.js");

test("exposes the contract types derived from the pricing sheet", () => {
  assert.deepEqual(
    CONTRACT_TYPES.map(({ label }) => label),
    [
      "Abitativo (Transitorio)",
      "Abitativo (Studenti)",
      "Abitativo (4+4)",
      "Abitativo - Concordato (3+2)",
      "Abitativo - Concordato (4+2)",
      "Abitativo - Concordato (5+2)",
      "Abitativo - Concordato (6+2)",
      "Commerciale (6+6)",
      "Non Abitativo (1+1)"
    ]
  );
});

test("uses the selected duration for transitorio contracts", () => {
  const quote = calculateQuote({
    plan: "start",
    payment: "monthly",
    contractTypeValue: "abitativo-transitorio",
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

test("falls back to the default variable duration when none is provided", () => {
  assert.equal(resolveDuration("abitativo-studenti"), 12);
});

test("uses fixed durations for standard contracts", () => {
  const quote = calculateQuote({
    plan: "start",
    payment: "single",
    contractTypeValue: "abitativo-4-4",
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
    contractTypeValue: "abitativo-concordato-5-2",
    rent: 700,
    condoFees: 150
  });
  const monthlyQuote = calculateQuote({
    plan: "full",
    payment: "monthly",
    contractTypeValue: "abitativo-concordato-5-2",
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
    contractTypeValue: "commerciale-6-6",
    rent: 3000,
    condoFees: 300
  });
  const nonResidentialQuote = calculateQuote({
    plan: "start",
    payment: "monthly",
    contractTypeValue: "non-abitativo-1-1",
    rent: 300,
    condoFees: 25
  });

  assert.equal(commercialQuote.vatExcluded, true);
  assert.equal(nonResidentialQuote.vatExcluded, true);
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

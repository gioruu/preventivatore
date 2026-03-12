(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  global.quoteLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const MIN_SINGLE_FEE = 450;
  const MIN_MONTHLY_FEE = 29;
  const MONTHLY_RATE = 0.05;
  const FULL_SINGLE_MONTHLY_FEE = 10;

  function createMonthlyOptions(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => {
      const value = start + index;

      return {
        value,
        label: `${value} mesi`
      };
    });
  }

  function createYearlyOptions(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => {
      const years = start + index;

      return {
        value: years * 12,
        label: `${years} ${years === 1 ? "anno" : "anni"}`
      };
    });
  }

  const CONTRACT_CATEGORIES = [
    { value: "abitativo", label: "Abitativo" },
    { value: "non-abitativo", label: "Non abitativo" }
  ];

  const CONTRACT_TYPES = [
    {
      category: "abitativo",
      value: "abitativo",
      label: "Abitativo 4+4",
      duration: 48,
      durationLabel: "4+4",
      vatExcluded: false
    },
    {
      category: "abitativo",
      value: "abitativo-concordato",
      label: "Abitativo concordato",
      durationOptions: [
        { value: 36, label: "3+2" },
        { value: 48, label: "4+2" },
        { value: 60, label: "5+2" },
        { value: 72, label: "6+2" }
      ],
      defaultDuration: 36,
      vatExcluded: false
    },
    {
      category: "abitativo",
      value: "studenti",
      label: "Studenti",
      durationOptions: createMonthlyOptions(6, 36),
      defaultDuration: 12,
      vatExcluded: false
    },
    {
      category: "abitativo",
      value: "transitorio",
      label: "Transitorio",
      durationOptions: createMonthlyOptions(6, 18),
      defaultDuration: 12,
      vatExcluded: false
    },
    {
      category: "non-abitativo",
      value: "commerciale",
      label: "Commerciale",
      duration: 72,
      durationLabel: "6+6",
      vatExcluded: true
    },
    {
      category: "non-abitativo",
      value: "non-abitativo",
      label: "Altri non abitativi",
      durationOptions: createYearlyOptions(1, 6),
      defaultDuration: 12,
      vatExcluded: true
    }
  ];

  function getContractTypesByCategory(categoryValue) {
    return CONTRACT_TYPES.filter(({ category }) => category === categoryValue);
  }

  function getContractCategory(contractTypeValue) {
    const contractType = typeof contractTypeValue === "string"
      ? getContractType(contractTypeValue)
      : contractTypeValue;

    return contractType ? contractType.category : "";
  }

  function requiresDurationSelection(contractTypeValue) {
    return getDurationOptions(contractTypeValue).length > 0;
  }

  function getDurationOptions(contractType) {
    const resolvedContractType = typeof contractType === "string"
      ? getContractType(contractType)
      : contractType;

    if (!resolvedContractType || !resolvedContractType.durationOptions) return [];

    return resolvedContractType.durationOptions.map((option) => (
      typeof option === "number"
        ? { value: option, label: `${option} mesi` }
        : option
    ));
  }

  function getDurationLabel(contractTypeValue, duration) {
    const contractType = typeof contractTypeValue === "string"
      ? getContractType(contractTypeValue)
      : contractTypeValue;

    if (!contractType) return "";
    if (contractType.durationLabel) return contractType.durationLabel;

    const resolvedDuration = resolveDuration(contractType, duration);
    const selectedOption = getDurationOptions(contractType)
      .find((option) => option.value === resolvedDuration);

    return selectedOption ? selectedOption.label : `${resolvedDuration} mesi`;
  }

  function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function getContractType(contractTypeValue) {
    return CONTRACT_TYPES.find(({ value }) => value === contractTypeValue) || null;
  }

  function resolveDuration(contractTypeValue, duration) {
    const contractType = typeof contractTypeValue === "string"
      ? getContractType(contractTypeValue)
      : contractTypeValue;

    if (!contractType) return 0;
    if (contractType.duration) return contractType.duration;

    const durationOptions = getDurationOptions(contractType);
    const normalizedDuration = Number(duration);
    return durationOptions.some((option) => option.value === normalizedDuration)
      ? normalizedDuration
      : contractType.defaultDuration;
  }

  function getProtectedAmount(rent, condoFees) {
    return roundCurrency(Math.max(0, Number(rent) || 0) + Math.max(0, Number(condoFees) || 0));
  }

  function getSingleBaseFee(protectedAmount) {
    return roundCurrency(Math.max(Number(protectedAmount) || 0, MIN_SINGLE_FEE));
  }

  function getMonthlyBaseFee(protectedAmount) {
    return roundCurrency(Math.max((Number(protectedAmount) || 0) * MONTHLY_RATE, MIN_MONTHLY_FEE));
  }

  function calculatePlanCost({ plan, payment, protectedAmount, duration }) {
    const singleBaseFee = getSingleBaseFee(protectedAmount);
    const monthlyBaseFee = getMonthlyBaseFee(protectedAmount);

    if (payment === "monthly") {
      return {
        activationFee: 0,
        recurringMonthlyFee: monthlyBaseFee,
        totalContractCost: roundCurrency(monthlyBaseFee * duration)
      };
    }

    if (plan === "full") {
      return {
        activationFee: singleBaseFee,
        recurringMonthlyFee: FULL_SINGLE_MONTHLY_FEE,
        totalContractCost: roundCurrency(singleBaseFee + FULL_SINGLE_MONTHLY_FEE * duration)
      };
    }

    return {
      activationFee: singleBaseFee,
      recurringMonthlyFee: 0,
      totalContractCost: singleBaseFee
    };
  }

  function getRecommendation({ plan, protectedAmount, duration }) {
    const single = calculatePlanCost({
      plan,
      payment: "single",
      protectedAmount,
      duration
    });
    const monthly = calculatePlanCost({
      plan,
      payment: "monthly",
      protectedAmount,
      duration
    });

    const recommendedPayment = single.totalContractCost <= monthly.totalContractCost
      ? "single"
      : "monthly";
    const alternativePayment = recommendedPayment === "single" ? "monthly" : "single";

    return {
      recommendedPayment,
      alternativePayment,
      singleTotal: single.totalContractCost,
      monthlyTotal: monthly.totalContractCost,
      savings: roundCurrency(Math.abs(single.totalContractCost - monthly.totalContractCost))
    };
  }

  function calculateQuote({
    plan,
    payment,
    contractTypeValue,
    duration,
    rent,
    condoFees = 0
  }) {
    const contractType = getContractType(contractTypeValue);

    if (!contractType) {
      throw new Error("Unknown contract type");
    }

    const resolvedDuration = resolveDuration(contractType, duration);
    const normalizedRent = roundCurrency(Number(rent) || 0);
    const normalizedCondoFees = roundCurrency(Number(condoFees) || 0);
    const protectedAmount = getProtectedAmount(normalizedRent, normalizedCondoFees);
    const pricing = calculatePlanCost({
      plan,
      payment,
      protectedAmount,
      duration: resolvedDuration
    });

    return {
      contractType,
      duration: resolvedDuration,
      rent: normalizedRent,
      condoFees: normalizedCondoFees,
      protectedAmount,
      vatExcluded: contractType.vatExcluded,
      ...pricing,
      recommendation: getRecommendation({
        plan,
        protectedAmount,
        duration: resolvedDuration
      })
    };
  }

  return {
    CONTRACT_CATEGORIES,
    CONTRACT_TYPES,
    FULL_SINGLE_MONTHLY_FEE,
    MIN_MONTHLY_FEE,
    MIN_SINGLE_FEE,
    MONTHLY_RATE,
    calculatePlanCost,
    calculateQuote,
    getContractCategory,
    getContractType,
    getContractTypesByCategory,
    getDurationLabel,
    getDurationOptions,
    getMonthlyBaseFee,
    getProtectedAmount,
    getRecommendation,
    getSingleBaseFee,
    requiresDurationSelection,
    resolveDuration,
    roundCurrency
  };
});

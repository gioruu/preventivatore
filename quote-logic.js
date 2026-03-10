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

  const CONTRACT_TYPES = [
    {
      value: "abitativo-transitorio",
      label: "Abitativo (Transitorio)",
      durationOptions: [6, 12, 18],
      defaultDuration: 12,
      vatExcluded: false
    },
    {
      value: "abitativo-studenti",
      label: "Abitativo (Studenti)",
      durationOptions: [6, 12, 18],
      defaultDuration: 12,
      vatExcluded: false
    },
    {
      value: "abitativo-4-4",
      label: "Abitativo (4+4)",
      duration: 48,
      vatExcluded: false
    },
    {
      value: "abitativo-concordato-3-2",
      label: "Abitativo - Concordato (3+2)",
      duration: 36,
      vatExcluded: false
    },
    {
      value: "abitativo-concordato-4-2",
      label: "Abitativo - Concordato (4+2)",
      duration: 48,
      vatExcluded: false
    },
    {
      value: "abitativo-concordato-5-2",
      label: "Abitativo - Concordato (5+2)",
      duration: 60,
      vatExcluded: false
    },
    {
      value: "abitativo-concordato-6-2",
      label: "Abitativo - Concordato (6+2)",
      duration: 72,
      vatExcluded: false
    },
    {
      value: "commerciale-6-6",
      label: "Commerciale (6+6)",
      duration: 72,
      vatExcluded: true
    },
    {
      value: "non-abitativo-1-1",
      label: "Non Abitativo (1+1)",
      duration: 12,
      vatExcluded: true
    }
  ];

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

    const normalizedDuration = Number(duration);
    return contractType.durationOptions.includes(normalizedDuration)
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
    CONTRACT_TYPES,
    FULL_SINGLE_MONTHLY_FEE,
    MIN_MONTHLY_FEE,
    MIN_SINGLE_FEE,
    MONTHLY_RATE,
    calculatePlanCost,
    calculateQuote,
    getContractType,
    getMonthlyBaseFee,
    getProtectedAmount,
    getRecommendation,
    getSingleBaseFee,
    resolveDuration,
    roundCurrency
  };
});


export const pharmacyInfo = {
  contractorCode: "1737",
  dispensingMonth: "JANUARY 2025",
  inTransition: "No"
};

export const itemCounts = {
  total: 9868,
  ams: 7751,
  mcr: 783,
  nhs: 342,
  cpus: 207,
  other: 785
};

export const costs = {
  totalGross: 101708.89,
  amsGross: 84804.68,
  mcrGross: 5447.44,
  nhsGross: 1294.58,
  cpusGross: 1630.87,
  otherGross: 8531.32,
  avgGross: 10.19
};

export const payments = {
  netIngredientCost: 100388.93,
  outOfPocket: 30.00,
  supplementaryPayments: 25556.52,
  stockOrderSubtotal: 175.89,
  dispensingPoolPayment: 12219.24,
  establishmentPayment: 2500.00,
  pharmacyFirstBase: 1000.00,
  pharmacyFirstActivity: 1400.06,
  phsSmoking: 60.00,
  phsContraceptive: 60.00,
  advancePayment: 138302.12,
  nextMonthAdvance: 138486.11,
  netPayment: 126774.45
};

export const changes = {
  totalGross: 3.5,
  netIngredientCost: 2.8,
  supplementaryPayments: 5.2,
  netPayment: 4.1,
  itemCounts: -1.2,
  amsItems: 1.8,
  mcrItems: -2.5,
  nhsItems: -0.9
};

export const insights = [
  {
    title: "Payment Growth Outpacing Volume",
    description: "Your net payments increased by 4.1% while prescription volume decreased by 1.2%. This indicates improved reimbursement rates compared to similar-sized pharmacies which averaged only 2.3% payment growth this quarter.",
    type: "positive" as const
  },
  {
    title: "AMS Performance Above Benchmark",
    description: "AMS items (7,751) represent 78.5% of your total volume, which is 8.2% higher than comparable pharmacies. This service line has grown 1.8% month-over-month while your peer group averaged 0.4% growth.",
    type: "positive" as const
  },
  {
    title: "M:CR Prescription Decline",
    description: "Your M:CR prescription items decreased by 2.5%, which is more than the average decrease of 1.3% seen across pharmacies of your size. Consider reviewing M:CR service promotion strategies.",
    type: "negative" as const
  }
];

export const benchmarkInsights = [
  {
    title: "Average Cost Per Item",
    description: "Your average cost per item (£10.19) is 8% higher than similar-sized pharmacies (£9.43). This may indicate a more complex dispensing mix or potential for generic substitution review.",
    type: "warning" as const
  },
  {
    title: "Dispensing Efficiency",
    description: "With 9,868 items processed by your pharmacy, you're operating at 12% higher efficiency than the average for your pharmacy size bracket (8,810 items).",
    type: "positive" as const
  }
];

export const financialInsights = [
  {
    title: "Category M Price Adjustment Impact",
    description: "Your pharmacy has a favorable position with recent Category M price adjustments, with a potential 2.7% increase in reimbursement value compared to the regional average of 1.9%.",
    type: "positive" as const
  },
  {
    title: "Service Diversification Opportunity",
    description: "Based on your prescription mix, expanding your PHS Contraceptive service could increase supplementary payments by up to £350 per month based on similar pharmacy performance.",
    type: "info" as const
  },
  {
    title: "Advanced Payment Optimization",
    description: "Your advanced payment schedule could be optimized based on your dispensing patterns. Our analysis shows a potential cash flow improvement of £2,800 monthly with adjusted timing.",
    type: "warning" as const
  }
];

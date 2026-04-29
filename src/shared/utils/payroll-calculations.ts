const DEFAULT_TETO_INSS = 1167.89;

export interface PayrollInput {
  totalHours: number;
  hourlyRate: number;
  baseSalary: number;
  inssPercentage: number;
  adminFeePercentage: number;
  tetoInss?: number;
}

export interface PayrollResult {
  grossPay: number;
  baseSalary: number;
  profitAdvance: number;
  inssDiscount: number;
  adminFeeDiscount: number;
  totalDiscounts: number;
  netPay: number;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculatePayroll = (input: PayrollInput): PayrollResult => {
  const totalHours = Math.max(0, Number(input.totalHours) || 0);
  const hourlyRate = Math.max(0, Number(input.hourlyRate) || 0);
  const baseSalary = Math.max(0, Number(input.baseSalary) || 0);
  const inssPercentage = Math.max(0, Number(input.inssPercentage) || 0);
  const adminFeePercentage = Math.max(0, Number(input.adminFeePercentage) || 0);
  const tetoInss = input.tetoInss ?? DEFAULT_TETO_INSS;

  const grossPay = round2(totalHours * hourlyRate);
  const profitAdvance = grossPay > 0 ? round2(grossPay - baseSalary) : 0;

  const inssDiscount =
    grossPay > 0 ? round2(-Math.min(baseSalary * (inssPercentage / 100), tetoInss)) : 0;

  const adminFeeDiscount = grossPay > 0 ? round2(-(grossPay * (adminFeePercentage / 100))) : 0;

  const totalDiscounts = round2(inssDiscount + adminFeeDiscount);
  const netPay = round2(grossPay + totalDiscounts);

  return {
    grossPay,
    baseSalary,
    profitAdvance,
    inssDiscount,
    adminFeeDiscount,
    totalDiscounts,
    netPay,
  };
};

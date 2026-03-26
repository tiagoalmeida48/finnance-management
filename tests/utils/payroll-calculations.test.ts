import { describe, it, expect } from "vitest";
import { calculatePayroll, TETO_INSS } from "@/shared/utils/payroll-calculations";

describe("calculatePayroll", () => {
  it("retorna zeros quando não há horas trabalhadas", () => {
    const result = calculatePayroll({
      totalHours: 0,
      hourlyRate: 100,
      baseSalary: 5000,
      inssPercentage: 11,
      adminFeePercentage: 5,
    });

    expect(result.grossPay).toBe(0);
    expect(result.profitAdvance).toBe(0);
    expect(result.inssDiscount).toBe(0);
    expect(result.adminFeeDiscount).toBe(0);
    expect(result.netPay).toBe(0);
  });

  it("calcula grossPay como totalHours * hourlyRate", () => {
    const result = calculatePayroll({
      totalHours: 160,
      hourlyRate: 50,
      baseSalary: 5000,
      inssPercentage: 0,
      adminFeePercentage: 0,
    });

    expect(result.grossPay).toBe(8000);
  });

  it("calcula profitAdvance como grossPay - baseSalary", () => {
    const result = calculatePayroll({
      totalHours: 160,
      hourlyRate: 50,
      baseSalary: 5000,
      inssPercentage: 0,
      adminFeePercentage: 0,
    });

    expect(result.profitAdvance).toBe(3000); // 8000 - 5000
  });

  it("limita inssDiscount ao TETO_INSS", () => {
    const result = calculatePayroll({
      totalHours: 160,
      hourlyRate: 100,
      baseSalary: 50000,
      inssPercentage: 11,
      adminFeePercentage: 0,
    });

    expect(result.inssDiscount).toBe(-TETO_INSS);
  });

  it("calcula inssDiscount sobre baseSalary com percentual correto", () => {
    const result = calculatePayroll({
      totalHours: 100,
      hourlyRate: 10,
      baseSalary: 1000,
      inssPercentage: 10,
      adminFeePercentage: 0,
    });

    expect(result.inssDiscount).toBe(-100); // 1000 * 10% = 100
  });

  it("calcula adminFeeDiscount sobre grossPay", () => {
    const result = calculatePayroll({
      totalHours: 100,
      hourlyRate: 100,
      baseSalary: 5000,
      inssPercentage: 0,
      adminFeePercentage: 10,
    });

    expect(result.adminFeeDiscount).toBe(-1000); // 10000 * 10% = 1000
  });

  it("netPay é grossPay menos todos os descontos", () => {
    const result = calculatePayroll({
      totalHours: 100,
      hourlyRate: 100,
      baseSalary: 5000,
      inssPercentage: 0,
      adminFeePercentage: 10,
    });

    expect(result.netPay).toBe(result.grossPay + result.totalDiscounts);
  });

  it("ignora valores negativos (trata como zero)", () => {
    const result = calculatePayroll({
      totalHours: -10,
      hourlyRate: -50,
      baseSalary: -1000,
      inssPercentage: -5,
      adminFeePercentage: -3,
    });

    expect(result.grossPay).toBe(0);
    expect(result.netPay).toBe(0);
  });

  it("arredonda resultados para 2 casas decimais", () => {
    const result = calculatePayroll({
      totalHours: 1,
      hourlyRate: 33.333,
      baseSalary: 0,
      inssPercentage: 0,
      adminFeePercentage: 0,
    });

    expect(result.grossPay).toBe(33.33);
  });
});

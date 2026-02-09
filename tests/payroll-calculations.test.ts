import { expect, test } from 'vitest';
import { TETO_INSS, calculatePayroll } from '../src/shared/utils/payroll-calculations';

test('calculatePayroll calcula resultado completo com descontos', () => {
    const payroll = calculatePayroll({
        totalHours: 200,
        hourlyRate: 20,
        baseSalary: 3000,
        inssPercentage: 11,
        adminFeePercentage: 4,
    });

    expect(payroll).toEqual({
        grossPay: 4000,
        baseSalary: 3000,
        profitAdvance: 1000,
        inssDiscount: -330,
        adminFeeDiscount: -160,
        totalDiscounts: -490,
        netPay: 3510,
    });
});

test('calculatePayroll respeita teto de INSS', () => {
    const payroll = calculatePayroll({
        totalHours: 220,
        hourlyRate: 50,
        baseSalary: 20000,
        inssPercentage: 20,
        adminFeePercentage: 0,
    });

    expect(payroll.inssDiscount).toBe(-TETO_INSS);
});

test('calculatePayroll zera descontos quando pagamento bruto e zero', () => {
    const payroll = calculatePayroll({
        totalHours: 0,
        hourlyRate: 0,
        baseSalary: 3000,
        inssPercentage: 11,
        adminFeePercentage: 4,
    });

    expect(payroll.grossPay).toBe(0);
    expect(payroll.inssDiscount).toBe(0);
    expect(payroll.adminFeeDiscount).toBe(0);
    expect(payroll.netPay).toBe(0);
});

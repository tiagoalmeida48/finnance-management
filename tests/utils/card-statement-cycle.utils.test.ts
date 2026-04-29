import { describe, it, expect } from "vitest";
import {
  normalizeDateKey,
  sortStatementCyclesAsc,
  resolveStatementCycleForDate,
  getCurrentStatementCycle,
  OPEN_CYCLE_END,
} from "@/shared/utils/card-statement-cycle.utils";

const makeCycle = (start: string, end: string, extra = {}) => ({
  date_start: start,
  date_end: end,
  closing_day: 10,
  due_day: 15,
  ...extra,
});

describe("normalizeDateKey", () => {
  it("retorna data no formato yyyy-MM-dd", () => {
    expect(normalizeDateKey("2024-03-15")).toBe("2024-03-15");
    expect(normalizeDateKey("2024-01-01")).toBe("2024-01-01");
  });

  it("lança erro para data inválida", () => {
    expect(() => normalizeDateKey("invalid")).toThrow("Data invalida.");
    expect(() => normalizeDateKey("")).toThrow();
  });
});

describe("sortStatementCyclesAsc", () => {
  it("ordena ciclos por date_start ascendente", () => {
    const cycles = [
      makeCycle("2024-03-01", "2024-03-31"),
      makeCycle("2024-01-01", "2024-01-31"),
      makeCycle("2024-02-01", "2024-02-29"),
    ];

    const sorted = sortStatementCyclesAsc(cycles);

    expect(sorted[0].date_start).toBe("2024-01-01");
    expect(sorted[1].date_start).toBe("2024-02-01");
    expect(sorted[2].date_start).toBe("2024-03-01");
  });

  it("não muta o array original", () => {
    const cycles = [
      makeCycle("2024-03-01", "2024-03-31"),
      makeCycle("2024-01-01", "2024-01-31"),
    ];
    const original = [...cycles];
    sortStatementCyclesAsc(cycles);
    expect(cycles[0].date_start).toBe(original[0].date_start);
  });
});

describe("resolveStatementCycleForDate", () => {
  const cycles = [
    makeCycle("2024-01-01", "2024-01-31"),
    makeCycle("2024-02-01", "2024-02-29"),
    makeCycle("2024-03-01", OPEN_CYCLE_END),
  ];

  it("retorna o ciclo que contém a data", () => {
    const cycle = resolveStatementCycleForDate(cycles, "2024-01-15");
    expect(cycle?.date_start).toBe("2024-01-01");
  });

  it("retorna o ciclo aberto para datas futuras", () => {
    const cycle = resolveStatementCycleForDate(cycles, "2025-06-01");
    expect(cycle?.date_start).toBe("2024-03-01");
    expect(cycle?.date_end).toBe(OPEN_CYCLE_END);
  });

  it("retorna null quando não há ciclo para a data", () => {
    const closedCycles = [
      makeCycle("2024-01-01", "2024-01-31"),
      makeCycle("2024-02-01", "2024-02-29"),
    ];
    const cycle = resolveStatementCycleForDate(closedCycles, "2025-01-01");
    expect(cycle).toBeNull();
  });
});

describe("getCurrentStatementCycle", () => {
  it("retorna o ciclo aberto quando não há ciclo para a data de referência", () => {
    const cycles = [
      makeCycle("2020-01-01", "2020-12-31"),
      makeCycle("2021-01-01", OPEN_CYCLE_END),
    ];

    const current = getCurrentStatementCycle(cycles, "2025-01-01");
    expect(current?.date_end).toBe(OPEN_CYCLE_END);
  });

  it("retorna null quando não há ciclos", () => {
    expect(getCurrentStatementCycle([])).toBeNull();
  });

  it("retorna o ciclo que contém a data de referência", () => {
    const cycles = [
      makeCycle("2024-01-01", "2024-06-30"),
      makeCycle("2024-07-01", OPEN_CYCLE_END),
    ];

    const current = getCurrentStatementCycle(cycles, "2024-03-15");
    expect(current?.date_start).toBe("2024-01-01");
  });
});

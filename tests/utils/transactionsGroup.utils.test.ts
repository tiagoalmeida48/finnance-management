import { describe, it, expect } from "vitest";
import {
  filterGroupUpdates,
  extractDayFromDateLike,
  replaceDateDayPreservingMonth,
  shiftDateByMonths,
  buildInstallmentDescription,
  stripInstallmentSuffix,
} from "@/shared/utils/transactionsGroup.utils";

describe("filterGroupUpdates", () => {
  it("remove campos não permitidos em atualizações de grupo", () => {
    const updates = {
      description: "Compra",
      amount: 100,
      id: "abc-123",
      installment_number: 2,
      installment_group_id: "group-1",
      user_id: "user-1",
    };

    const result = filterGroupUpdates(updates);

    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("amount");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("installment_number");
    expect(result).not.toHaveProperty("installment_group_id");
    expect(result).not.toHaveProperty("user_id");
  });
});

describe("extractDayFromDateLike", () => {
  it("extrai o dia de uma string de data", () => {
    expect(extractDayFromDateLike("2024-03-15")).toBe(15);
    expect(extractDayFromDateLike("2024-01-01")).toBe(1);
    expect(extractDayFromDateLike("2024-12-31")).toBe(31);
  });

  it("retorna null para valores inválidos", () => {
    expect(extractDayFromDateLike(null)).toBeNull();
    expect(extractDayFromDateLike(undefined)).toBeNull();
    expect(extractDayFromDateLike("invalid")).toBeNull();
    expect(extractDayFromDateLike("")).toBeNull();
  });
});

describe("replaceDateDayPreservingMonth", () => {
  it("substitui o dia mantendo ano e mês", () => {
    expect(replaceDateDayPreservingMonth("2024-03-15", 10)).toBe("2024-03-10");
    expect(replaceDateDayPreservingMonth("2024-01-01", 31)).toBe("2024-01-31");
  });

  it("limita o dia ao máximo do mês", () => {
    // Fevereiro tem 28 dias em 2023 (não bissexto)
    expect(replaceDateDayPreservingMonth("2023-02-10", 31)).toBe("2023-02-28");
  });

  it("retorna null para datas inválidas", () => {
    expect(replaceDateDayPreservingMonth(null, 10)).toBeNull();
    expect(replaceDateDayPreservingMonth(undefined, 10)).toBeNull();
    expect(replaceDateDayPreservingMonth("invalid", 10)).toBeNull();
  });

  it("retorna null para dias inválidos", () => {
    expect(replaceDateDayPreservingMonth("2024-03-15", 0)).toBeNull();
    expect(replaceDateDayPreservingMonth("2024-03-15", 32)).toBeNull();
  });
});

describe("shiftDateByMonths", () => {
  it("avança meses corretamente", () => {
    expect(shiftDateByMonths("2024-01-15", 1)).toBe("2024-02-15");
    expect(shiftDateByMonths("2024-01-15", 3)).toBe("2024-04-15");
    expect(shiftDateByMonths("2024-11-15", 2)).toBe("2025-01-15");
  });

  it("volta meses corretamente", () => {
    expect(shiftDateByMonths("2024-03-15", -1)).toBe("2024-02-15");
    expect(shiftDateByMonths("2024-01-15", -1)).toBe("2023-12-15");
  });

  it("ajusta dia para o máximo do mês destino", () => {
    // 31 de janeiro + 1 mês = fevereiro que tem 28/29 dias
    expect(shiftDateByMonths("2023-01-31", 1)).toBe("2023-02-28");
  });

  it("retorna null para entradas inválidas", () => {
    expect(shiftDateByMonths(null, 1)).toBeNull();
    expect(shiftDateByMonths(undefined, 1)).toBeNull();
    expect(shiftDateByMonths("invalid", 1)).toBeNull();
  });
});

describe("buildInstallmentDescription", () => {
  it("constrói descrição com número e total de parcelas", () => {
    expect(buildInstallmentDescription("Compra", 1, 12)).toBe("Compra (01/12)");
    expect(buildInstallmentDescription("Netflix", 3, 3)).toBe("Netflix (03/03)");
  });

  it("formata números com dois dígitos", () => {
    expect(buildInstallmentDescription("Teste", 9, 10)).toBe("Teste (09/10)");
  });
});

describe("stripInstallmentSuffix", () => {
  it("remove sufixo de parcela da descrição", () => {
    expect(stripInstallmentSuffix("Compra (01/12)")).toBe("Compra");
    expect(stripInstallmentSuffix("Netflix (03/03)")).toBe("Netflix");
  });

  it("mantém descrições sem sufixo", () => {
    expect(stripInstallmentSuffix("Compra simples")).toBe("Compra simples");
  });

  it("lida com valores nulos/vazios", () => {
    expect(stripInstallmentSuffix(null)).toBe("");
    expect(stripInstallmentSuffix("")).toBe("");
  });
});

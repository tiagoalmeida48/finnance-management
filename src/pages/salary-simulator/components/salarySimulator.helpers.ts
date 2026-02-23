import { colors } from "@/shared/theme";
import type { SalarySetting } from "@/shared/interfaces";

export interface EditSettingForm {
  originalDateStart: string;
  originalDateEnd: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: string;
  baseSalary: string;
  inssPercentage: string;
  adminFeePercentage: string;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatDateBR = (value: string) => {
  if (value === "9999-12-31") return "Vigente";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
};

export const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return "Nao foi possivel salvar a configuracao.";
};

export const buildSettingKey = (
  setting: Pick<SalarySetting, "date_start" | "date_end">,
) => `${setting.date_start}|${setting.date_end}`;

export const blockedInputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "transparent",
    borderRadius: "10px 10px 0 0",
    borderBottom: `1px solid ${colors.border}`,
    alignItems: "flex-end",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
    "&.Mui-disabled fieldset": { border: "none" },
  },
  "& .MuiInputBase-input": {
    paddingTop: "8px",
    paddingBottom: "4px",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: colors.textSecondary,
    fontWeight: 600,
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: colors.textMuted,
  },
};

export const modernDateInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, var(--overlay-white-03) 0%, var(--overlay-white-015) 100%)",
    "& fieldset": { borderColor: "var(--overlay-white-14)" },
    "&:hover fieldset": { borderColor: "var(--overlay-white-24)" },
    "&.Mui-focused fieldset": { borderColor: colors.accent },
  },
  "& .MuiSvgIcon-root": {
    color: colors.accent,
  },
  "& .MuiIconButton-root:hover": {
    backgroundColor: "var(--overlay-primary-14)",
  },
};

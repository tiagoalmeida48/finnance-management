/**
 * Formats a number as a BRL currency string, always using its absolute value
 * (removing the '-' or '+' signs).
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
};

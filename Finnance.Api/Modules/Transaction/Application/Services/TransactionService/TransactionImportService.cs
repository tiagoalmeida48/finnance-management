using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Shared.Utils;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    private static readonly Dictionary<string, string[]> ImportHeaderAliases = new()
    {
        ["date"] = ["data", "date", "dia"],
        ["description"] = ["descricao", "description", "historico", "nome"],
        ["amount"] = ["valor", "amount", "value", "preco"],
        ["category"] = ["categoria", "category"],
        ["notes"] = ["notas", "nota", "notes", "observacao", "observacoes", "obs"]
    };

    private static readonly Regex IsoDatePattern = new(@"^\d{4}-\d{2}-\d{2}");
    private static readonly Regex BrDatePattern = new(@"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})");

    public ImportPreviewResultDto ParseImport(string content, long userId)
    {
        var table = SplitCsvRows(content ?? string.Empty);
        var errors = new List<string>();
        var rows = new List<ImportRowDto>();

        if (table.Count < 2)
            return new ImportPreviewResultDto { Rows = rows, Errors = ["Arquivo vazio ou sem linhas de dados."] };

        var header = table[0];
        var dateIdx = FindHeaderIndex(header, "date");
        var descriptionIdx = FindHeaderIndex(header, "description");
        var amountIdx = FindHeaderIndex(header, "amount");
        var categoryIdx = FindHeaderIndex(header, "category");
        var notesIdx = FindHeaderIndex(header, "notes");

        if (descriptionIdx < 0 || amountIdx < 0 || dateIdx < 0)
            return new ImportPreviewResultDto
            {
                Rows = rows,
                Errors = ["Cabeçalho inválido. Use as colunas: Data; Descrição; Valor; Categoria; Notas."]
            };

        var categoriesByName = categoryService.List(userId)
            .GroupBy(c => c.Name.Trim().ToLowerInvariant())
            .ToDictionary(g => g.Key, g => g.First().Category);

        for (var i = 1; i < table.Count; i++)
        {
            var cells = table[i];
            var line = i + 1;
            var description = CellAt(cells, descriptionIdx).Trim();
            var signedAmount = ParseImportAmount(CellAt(cells, amountIdx));
            var date = ParseImportDate(CellAt(cells, dateIdx));

            if (string.IsNullOrEmpty(description))
            {
                errors.Add($"Linha {line}: descrição vazia.");
                continue;
            }

            if (!signedAmount.HasValue || signedAmount.Value == 0)
            {
                errors.Add($"Linha {line}: valor inválido.");
                continue;
            }

            if (string.IsNullOrEmpty(date))
            {
                errors.Add($"Linha {line}: data inválida.");
                continue;
            }

            var categoryName = categoryIdx >= 0 ? CellAt(cells, categoryIdx).Trim() : string.Empty;
            long? category = categoryName.Length > 0
                && categoriesByName.TryGetValue(categoryName.ToLowerInvariant(), out var categoryId)
                ? categoryId
                : null;

            rows.Add(new ImportRowDto
            {
                Date = date,
                Description = description,
                Amount = Math.Abs(signedAmount.Value),
                TransactionType = signedAmount.Value < 0
                    ? Constants.TransactionTypeId.EXPENSE
                    : Constants.TransactionTypeId.INCOME,
                Category = category,
                Installments = 0,
                Notes = notesIdx >= 0 ? CellAt(cells, notesIdx).Trim() : string.Empty
            });
        }

        return new ImportPreviewResultDto { Rows = rows, Errors = errors };
    }

    public int ImportTransactions(ImportDto input, long userId)
    {
        if (input.Account <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (input.Rows == null || input.Rows.Count == 0)
            throw new ApplicationException(Constants.ErrorMessage.ImportNoRows);

        var onCard = input.PaymentMethod == Constants.PaymentMethodId.CREDIT && input.Card is > 0;

        using var tran = GetTransaction();

        foreach (var row in input.Rows)
        {
            var isInstallment = row.Installments >= 2;

            CreateTransaction(new TransactionCreateDto
            {
                TransactionType = row.TransactionType,
                Amount = row.Amount,
                Description = row.Description,
                PaymentDate = ParseIsoDate(row.Date),
                PurchaseDate = onCard ? ParseIsoDate(row.Date) : null,
                Account = input.Account,
                ToAccount = null,
                Card = onCard ? input.Card : null,
                Category = row.Category is > 0 ? row.Category : null,
                PaymentMethod = input.PaymentMethod is > 0 ? input.PaymentMethod : null,
                Notes = row.Notes ?? string.Empty,
                IsPaid = input.PaymentMethod == Constants.PaymentMethodId.DEBIT,
                IsFixed = false,
                IsInstallment = isInstallment,
                TotalInstallments = isInstallment ? row.Installments : 1,
                RepeatCount = 1
            }, userId);
        }

        tran.Complete();
        return input.Rows.Count;
    }

    private static List<string[]> SplitCsvRows(string text)
    {
        var lines = text.Replace("\r\n", "\n").Replace('\r', '\n')
            .Split('\n')
            .Where(line => line.Trim().Length > 0)
            .ToList();

        if (lines.Count == 0)
            return [];

        var delimiter = lines[0].Contains(';') ? ';' : ',';

        return lines
            .Select(line => line.Split(delimiter).Select(cell => cell.Trim().Trim('"').Trim()).ToArray())
            .ToList();
    }

    private static string CellAt(string[] cells, int index)
    {
        return index >= 0 && index < cells.Length ? cells[index] ?? string.Empty : string.Empty;
    }

    private static int FindHeaderIndex(string[] header, string key)
    {
        var aliases = ImportHeaderAliases[key];
        for (var i = 0; i < header.Length; i++)
        {
            if (aliases.Contains(NormalizeHeader(header[i])))
                return i;
        }

        return -1;
    }

    private static string NormalizeHeader(string value)
    {
        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);

        foreach (var ch in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        }

        return sb.ToString();
    }

    private static decimal? ParseImportAmount(string raw)
    {
        var cleaned = Regex.Replace(raw ?? string.Empty, @"[R$\s]", string.Empty, RegexOptions.IgnoreCase);
        if (cleaned.Length == 0)
            return null;

        var normalized = cleaned.Contains(',') && cleaned.LastIndexOf(',') > cleaned.LastIndexOf('.')
            ? cleaned.Replace(".", string.Empty).Replace(',', '.')
            : cleaned.Replace(",", string.Empty);

        return decimal.TryParse(normalized, NumberStyles.Number | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var value)
            ? value
            : null;
    }

    private static string ParseImportDate(string raw)
    {
        var value = (raw ?? string.Empty).Trim();

        if (IsoDatePattern.IsMatch(value))
            return value[..10];

        var match = BrDatePattern.Match(value);
        if (!match.Success)
            return string.Empty;

        var day = match.Groups[1].Value.PadLeft(2, '0');
        var month = match.Groups[2].Value.PadLeft(2, '0');
        var year = match.Groups[3].Value.Length == 2 ? $"20{match.Groups[3].Value}" : match.Groups[3].Value;

        return $"{year}-{month}-{day}";
    }

    private static DateTime? ParseIsoDate(string value)
    {
        return DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date
            : throw new ApplicationException(Constants.ErrorMessage.ImportInvalidDate);
    }
}

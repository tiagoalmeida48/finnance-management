using Finnance.Api.Shared.BaseClass;
using QRCoder;
using System.Collections.Concurrent;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public static string FormatCpf(this string str)
    {
        return Regex.Replace(str, "[.-]", "");
    }

    public static string FormatCnpj(this string str)
    {
        return Regex.Replace(str, "[./-]", "");
    }

    public static string MaxStr(this string value, int maxLength)
    {
        return value?[..Math.Min(value.Length, maxLength)];
    }

    public static string CapitalizeFirstLetter(this string value)
    {
        return char.ToUpper(value[0]) + value[1..].ToLower();
    }

    public static string CleanCharacters(this string val)
    {
        return val.IsNotEmpty() ? val.Replace("'", string.Empty).Replace("\"", string.Empty) : val;
    }

    public static string ToPascalCase(this string value)
    {
        var myTI = new CultureInfo("pt-BR", false).TextInfo;
        return myTI.ToTitleCase(value);
    }

    public static bool IsAlphanumeric(this string input)
    {
        return input.IsNotEmpty() && Regex.IsMatch(input, @"^[a-zA-Z0-9]+$");
    }

    public static string RemoveFrom(this string input, string substringToRemove)
    {
        var startIndex = input.IndexOf(substringToRemove, StringComparison.Ordinal);
        return startIndex != -1 ? input[..startIndex] : input;
    }

    public static string ConvertStringToUtf8Bom(this string source)
    {
        var result = source.ConvertStringToUtf8BomData();
        return Convert.ToBase64String(result);
    }

    private static string Text(this TextReader reader)
    {
        return char.ConvertFromUtf32(reader.Peek());
    }

    public static string GetValueDictionary(this Dictionary<string, string> dictionary, string value)
    {
        return dictionary.GetValueOrDefault(value);
    }

    public static string ToNullWhenEmpty(this string val)
    {
        return val.IsEmpty() ? null : val;
    }

    public static T? ToNullWhenEmpty<T>(this T val) where T : struct
    {
        return EqualityComparer<T>.Default.Equals(val, default) ? null : val;
    }

    public static T? ToNullWhenEmpty<T>(this T? val) where T : struct
    {
        return val.HasValue && !EqualityComparer<T>.Default.Equals(val.Value, default) ? val : null;
    }

    public static T ToZeroWhenEmpty<T>(this T? val) where T : struct, IConvertible
    {
        return val ?? (T)Convert.ChangeType(0, typeof(T));
    }

    public static string ToB64Str(this string val)
    {
        if (val.IsEmpty()) return null;
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(val));
    }

    public static IEnumerable<string> GetLines(this string text, int lineMax)
    {
        using TextReader reader = new StringReader(text);
        var line = new StringBuilder();
        foreach (var word in reader.ReadWords())
        {
            if (line.Length + word.Length < lineMax)
                line.Append($"{word} ");
            else
            {
                yield return line.ToString().Trim();
                line = new StringBuilder($"{word} ");
            }
        }

        if (line.Length > 0)
            yield return line.ToString().Trim();
    }

    private static IEnumerable<string> ReadWords(this TextReader reader)
    {
        while (!reader.IsEof())
        {
            var word = new StringBuilder();
            while (!reader.IsBreak())
            {
                word.Append(reader.Text());
                reader.Read();
            }

            reader.Read();
            if (word.Length > 0)
                yield return word.ToString();
        }
    }

    public static string ToStringHex(this byte[] ba)
    {
        return Convert.ToHexString(ba);
    }

    public static string FormatListToJson(this IEnumerable<int> listInteger)
    {
        return listInteger.IsNotEmpty() ? JsonSerializer.Serialize(listInteger.Order()) : null;
    }

    public static string ToQrCodeB64(this string data, int size = 5)
    {
        var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new Base64QRCode(qrCodeData);
        return qrCode.GetGraphic(size);
    }

    public static string NormalizeQueryColumnName(this string columnName)
    {
        columnName = columnName.Trim();

        var lastDotIndex = columnName.LastIndexOf('.');
        if (lastDotIndex != -1)
            columnName = columnName.Substring(lastDotIndex + 1);

        columnName = columnName.Trim('[', ']', '"', '\'', '`');
        return columnName;
    }

    public static string FormatErrorsToJson<Y>(object result) where Y : BaseCsv
    {
        if (result is ConcurrentStack<Y> res && res.IsNotEmpty())
            return $"[{string.Join(" | ", res.OrderBy(x => x.LineCsv).Select(x => x.MessageFormated))}]";

        if (result is ConcurrentStack<string> resNew && resNew.IsNotEmpty())
            return $"[{string.Join(" | ", resNew.OrderBy(x => x).Select(x => x))}]";

        return null;
    }

    public static string GetJobTime(this int intervalMin)
    {
        return intervalMin switch
        {
            1 => "* * * * *",
            < 60 when 60 % intervalMin == 0 => $"*/{intervalMin} * * * *",
            60 => "0 * * * *",
            > 60 and < 1440 when intervalMin % 60 == 0 => $"0 */{intervalMin / 60} * * *",
            1440 => "0 0 * * *",
            _ => null
        };
    }
}
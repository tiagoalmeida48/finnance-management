using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    private readonly static Regex isGuid =
        new(@"^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$", RegexOptions.Compiled);

    public static bool IsValidEmail(this string pseudoEmail)
    {
        try
        {
            MailAddress _ = new(pseudoEmail);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public static bool NotEquals(this string value, string value2)
    {
        value = string.IsNullOrEmpty(value) ? string.Empty : value;
        value2 = string.IsNullOrEmpty(value2) ? string.Empty : value2;

        return !value.Equals(value2, StringComparison.InvariantCultureIgnoreCase);
    }

    public static bool NotContains(this string value, params string[] values)
    {
        if (values == null || values.Length == 0) return true;

        return !values.Select(x => x ?? string.Empty)
            .Contains(value ?? string.Empty, StringComparer.InvariantCultureIgnoreCase);
    }

    public static bool NotContains<TSource>(this IEnumerable<TSource> source, TSource value)
    {
        return !source.Contains(value);
    }

    public static bool IsNotEmpty(this string reader)
    {
        return !string.IsNullOrWhiteSpace(reader);
    }

    public static bool IsEmpty(this string reader)
    {
        return string.IsNullOrWhiteSpace(reader);
    }

    public static bool IsBreak(this TextReader reader)
    {
        return reader.IsEof() || reader.IsWhiteSpace();
    }

    public static bool IsWhiteSpace(this TextReader reader)
    {
        return string.IsNullOrWhiteSpace(reader.Text());
    }

    public static bool IsEof(this TextReader reader)
    {
        return reader.Peek() == -1;
    }

    public static bool IsValid(this string pseudoGuid)
    {
        return isGuid.IsMatch(pseudoGuid);
    }

    public static bool IsEmpty<T>(this IEnumerable<T> model)
    {
        return model == null || !model.Any();
    }

    public static bool IsNotEmpty<T>(this IEnumerable<T> model)
    {
        return !model.IsEmpty();
    }

    public static bool IsSvgFile(this string pFile)
    {
        return (pFile ?? "").Contains("<svg") && pFile.Contains("/svg>");
    }

    public static bool ContainsSpecialCharacters(this string str)
    {
        var regex = new Regex(@"[^A-Za-z0-9:\/ ]");
        return regex.IsMatch(str);
    }
}
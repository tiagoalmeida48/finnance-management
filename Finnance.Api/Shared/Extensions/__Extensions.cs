using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public static TAttribute GetAttribute<TAttribute>(this Enum value)
        where TAttribute : Attribute
    {
        var enumType = value.GetType();
        var name = Enum.GetName(enumType, value);
        return enumType.GetField(name).GetCustomAttributes(false).OfType<TAttribute>().SingleOrDefault();
    }

    public static IEnumerable<TSource> LocalDistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
    {
        HashSet<TKey> knownKeys = [];
        foreach (var element in source)
        {
            if (knownKeys.Add(keySelector(element)))
                yield return element;
        }
    }

    public static T[] ConvertTo<T>(this string[] array)
    {
        return array?.Select(x => (T)Convert.ChangeType(x, typeof(T))).ToArray();
    }

    public static T ChangeType<T>(this object value, T defValue)
    {
        while (true)
        {
            var toType = typeof(T);

            if (value == null)
                return default;

            if (value is string @string)
            {
                if (toType == typeof(Guid))
                {
                    value = new Guid(Convert.ToString(value) ?? string.Empty);
                    continue;
                }

                if (@string == string.Empty && toType != typeof(string))
                    return defValue;
            }
            else
            {
                if (typeof(T) == typeof(string))
                {
                    value = Convert.ToString(value);
                    continue;
                }
            }

            if (toType.IsGenericType && toType.GetGenericTypeDefinition() == typeof(Nullable<>))
                toType = Nullable.GetUnderlyingType(toType);

            var canConvert = toType.IsValueType && !toType.IsEnum;
            if (canConvert)
                return (T)Convert.ChangeType(value, toType);

            return (T)value;
        }
    }

    public static Dictionary<Type, Type> GetSouls(this Assembly assembly, string namesSpace, string[] excludeClasses)
    {
        var classes = (from type in assembly.GetExportedTypes()
                where !excludeClasses.Any(ec => type.Name.StartsWith(ec))
                where type.Namespace.Equals(namesSpace)
                select new { c = type, i = type.GetInterface("I" + type.Name) })
            .OrderBy(s => s.c.Name)
            .ToDictionary(d => d.c, d => d.i);

        return classes;
    }

    public static IEnumerable<T> FormatJsonToList<T>(this string json)
    {
        return json.IsNotEmpty() ? JsonSerializer.Deserialize<IEnumerable<T>>(json) : null;
    }

    public static (string erro, string track) ConcatenateErrors(this Exception ex)
    {
        var sbError = new StringBuilder();
        var sbTrack = new StringBuilder();

        var maxTurn = 10;

        var currentError = ex;
        while (currentError != null)
        {
            sbError.Append(SanitizeErrorMessage(currentError.Message));
            sbTrack.Append(currentError.StackTrace ?? string.Empty);
            currentError = currentError.InnerException;

            if (maxTurn == 0)
                break;

            maxTurn--;
        }

        return (sbError.ToString(), sbTrack.ToString());
    }

    public static string FormatStringToArrayJson(this string stringData)
    {
        if (stringData.IsEmpty()) return null;

        if (stringData[0] == '[')
            return stringData;

        return $"[{stringData}]";
    }

    private static string SanitizeErrorMessage(string message)
    {
        if (message.IsEmpty())
            return message;

        message = Regex.Replace(message, @"[A-Za-z]:\\[^\\]*\\[^\\]*\\.*?\\", "[CAMINHO_ARQUIVO]\\");
        message = Regex.Replace(message, "/[^/]*/[^/]*/.*?/", "[CAMINHO_ARQUIVO]/");

        message = Regex.Replace(message, @"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", "[IP_SERVIDOR]");

        message = Regex.Replace(message, @"\\Users\\[^\\]+\\", @"\Users\[USUARIO]\");

        return message;
    }
}
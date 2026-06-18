using System.Text.RegularExpressions;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public static DateTime? To_23_59_59(this DateTime? value)
    {
        return value?.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
    }

    public static string FormatStringWithDate(this string data)
    {
        return $"{data}_{DateTime.Now:ddMMyyyyHHmmss}";
    }

    public static bool IsValidTimeSpan(this string timeSpan)
    {
        const string timePattern = @"^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$";
        return Regex.IsMatch(timeSpan, timePattern);
    }

    public static DateTime ConvertToDatetime(this string timeSpanSap)
    {
        var timestamp = long.Parse(Regex.Match(timeSpanSap, @"\d+").Value);
        var dto = DateTimeOffset.FromUnixTimeMilliseconds(timestamp);
        return dto.DateTime;
    }

    public static DateTime ToTimeZone(this DateTime dateTime, string timeZone)
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
        return TimeZoneInfo.ConvertTimeFromUtc(dateTime, tz);
    }
}
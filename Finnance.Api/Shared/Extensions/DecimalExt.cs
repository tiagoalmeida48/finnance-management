using System.Globalization;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public static decimal ToFix(this decimal value, int decimals)
    {
        return Math.Round(value, decimals);
    }

    public static decimal ToDecimalPoint(this string value)
    {
        value = value.IsEmpty() ? "0" : value;
        value = value.Replace(".", ",");
        return Convert.ToDecimal(value, new CultureInfo("pt-Br"));
    }
}
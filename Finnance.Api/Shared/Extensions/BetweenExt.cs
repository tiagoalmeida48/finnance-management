namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public static bool Between(this sbyte value, sbyte from, sbyte to, bool inclusive = true)
    {
        return ((long)value).Between(from, to, inclusive);
    }

    public static bool Between(this byte value, byte from, byte to, bool inclusive = true)
    {
        return ((ulong)value).Between(from, to, inclusive);
    }

    public static bool Between(this short value, short from, short to, bool inclusive = true)
    {
        return ((long)value).Between(from, to, inclusive);
    }

    public static bool Between(this ushort value, ushort from, ushort to, bool inclusive = true)
    {
        return ((ulong)value).Between(from, to, inclusive);
    }

    public static bool Between(this int value, int from, int to, bool inclusive = true)
    {
        return ((long)value).Between(from, to, inclusive);
    }

    public static bool Between(this uint value, uint from, uint to, bool inclusive = true)
    {
        return ((ulong)value).Between(from, to, inclusive);
    }

    public static bool Between(this long value, long from, long to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this ulong value, ulong from, ulong to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this decimal value, decimal from, decimal to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this decimal? value, decimal? from, decimal? to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this double? value, double? from, double? to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this double value, double from, double to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool Between(this DateTime value, DateTime from, DateTime to, bool inclusive = true)
    {
        bool result;

        if (inclusive)
            result = value >= from && value <= to;
        else
            result = value > from && value < to;

        return result;
    }

    public static bool IsBetween(this DateTime dt, DateTime startDate, DateTime endDate, bool compareTime = false)
    {
        return compareTime ? dt >= startDate && dt <= endDate : dt.Date >= startDate.Date && dt.Date <= endDate.Date;
    }

    public static bool IsBetween(this TimeSpan dt, TimeSpan startDate, TimeSpan endDate)
    {
        return dt >= startDate && dt <= endDate;
    }
}
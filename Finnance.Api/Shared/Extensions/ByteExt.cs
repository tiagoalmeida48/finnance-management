using Finnance.Api.Shared.Utils;
using System.Globalization;
using System.Text;

namespace Finnance.Api.Shared;

public static partial class Extensions
{

    private readonly static Dictionary<string, byte[]> FileSignatures = new()
    {
        { ".jpg", [0xFF, 0xD8, 0xFF] },
        { ".jpeg", [0xFF, 0xD8, 0xFF] },
        { ".png", [0x89, 0x50, 0x4E, 0x47] },
        { ".gif", [0x47, 0x49, 0x46, 0x38] },
        { ".pdf", [0x25, 0x50, 0x44, 0x46] },
        { ".zip", [0x50, 0x4B, 0x03, 0x04] },
        { ".docx", [0x50, 0x4B, 0x03, 0x04] },
        { ".xlsx", [0x50, 0x4B, 0x03, 0x04] },
        { ".pptx", [0x50, 0x4B, 0x03, 0x04] },
        { ".mp3", [0x49, 0x44, 0x33] },
        { ".mp4", [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] }
    };

    public static byte[] ConvertStringToUtf8BomData(this string source)
    {
        var data = Encoding.UTF8.GetBytes(source);
        var result = Encoding.UTF8.GetPreamble().Concat(data).ToArray();

        return result;
    }

    public static byte[] GetBytesFromB64(this string stringB64)
    {
        if (stringB64.IsNotEmpty())
            return Convert.FromBase64String(stringB64);

        return [];
    }

    public static byte[] GetBytesFromText(this string text)
    {
        if (text.IsNotEmpty())
            return Encoding.UTF8.GetBytes(text);

        return [];
    }

    public static byte GetDaysOfMonths(this DateTime value)
    {
        var calendar = CultureInfo.CurrentCulture.Calendar;
        var numberWeek = calendar.GetWeekOfYear(value, CalendarWeekRule.FirstDay, DayOfWeek.Sunday);
        return Convert.ToByte(numberWeek);
    }

    public static byte[] ToBytesFromHex(this string hex)
    {
        var NumberChars = hex.Length;
        var bytes = new byte[NumberChars / 2];
        for (var i = 0; i < NumberChars; i += 2)
            bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
        return bytes;
    }

    public static byte[] ToStrByte(this string value)
    {
        if (value.IsEmpty()) return null;
        return Encoding.UTF8.GetBytes(value);
    }

    public static int ToMegaBytes(this long bytes)
    {
        return (int)(bytes / Constants.BytesInMB);
    }

    public static Encoding GetEncoding(this byte[] bytes)
    {
        // Read the BOM
        var bom = bytes.Take(4).ToArray();

        // Analyze the BOM
        if (bom[0] == 0xef && bom[1] == 0xbb && bom[2] == 0xbf) return Encoding.UTF8;
        if (bom[0] == 0xff && bom[1] == 0xfe && bom[2] == 0 && bom[3] == 0) return Encoding.UTF32; //UTF-32LE
        if (bom[0] == 0xff && bom[1] == 0xfe) return Encoding.Unicode; //UTF-16LE
        if (bom[0] == 0xfe && bom[1] == 0xff) return Encoding.BigEndianUnicode; //UTF-16BE
        if (bom[0] == 79 && bom[1] == 114) return Encoding.GetEncoding("ISO-8859-1"); //ISO-8859-1
        if (bom[0] == 0 && bom[1] == 0 && bom[2] == 0xfe && bom[3] == 0xff) return new UTF32Encoding(true, true); //UTF-32BE

        // Return the default encoding
        return Encoding.ASCII;
    }

    public static byte[] GetBytesFromFileStream(this FileStream fileStream)
    {
        if (fileStream == null) return null;

        using MemoryStream memoryStream = new();
        fileStream.CopyTo(memoryStream);
        return memoryStream.ToArray();
    }

    public static byte[] ConvertStreamToByteArray(this Stream stream)
    {
        using var memoryStream = new MemoryStream();

        if (stream.CanSeek)
            stream.Position = 0;

        stream.CopyTo(memoryStream);
        var memoryStreamBytes = memoryStream.ToArray();
        return memoryStreamBytes;
    }


    public static MemoryStream GetMemoryStreamFromBytes(this byte[] bytes, bool writable = true)
    {
        var memoryStream = new MemoryStream(bytes, writable);
        memoryStream.Position = 0;
        return memoryStream;
    }

    public static string GetFileExtension(this byte[] bytes)
    {
        if (bytes == null || bytes.Length == 0)
            return string.Empty;

        foreach (var signature in FileSignatures)
        {
            if (bytes.Length < signature.Value.Length) continue;

            var headerBytes = bytes.Take(signature.Value.Length).ToArray();
            if (headerBytes.SequenceEqual(signature.Value))
                return signature.Key;
        }

        return string.Empty;
    }

    public static bool IsFileType(this byte[] bytes, string extension)
    {
        if (bytes == null || bytes.Length == 0 || string.IsNullOrWhiteSpace(extension))
            return false;

        if (!FileSignatures.ContainsKey(extension.ToLower()))
            return false;

        var signature = FileSignatures[extension.ToLower()];
        return bytes.Length > signature.Length && bytes.Take(signature.Length).SequenceEqual(signature);
    }
}
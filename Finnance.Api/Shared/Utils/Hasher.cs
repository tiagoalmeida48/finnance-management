using System.Security.Cryptography;
using System.Text;

namespace Finnance.Api.Shared.Utils;

public static class HashHelper
{
    public const string KeyConnectionString = "PlphxBSeRe766jNPux65rmBKoIj2a8NXXfj9dJQK0eo=";

    public static string ToBase64SHA384(this string openText)
    {
        var dataTxt = Encoding.ASCII.GetBytes(openText);
        var result = Convert.ToBase64String(SHA384.HashData(dataTxt));
        return result;
    }

    public static string ToSHA384Hex(string hash)
    {
        var dataTxt = Encoding.ASCII.GetBytes(hash);
        using var memoryStream = new MemoryStream(dataTxt);
        var ms = memoryStream.ToSHA384().Result;
        return ms;
    }

    public static async Task<string> ToSHA384(this Stream openByte)
    {
        var shaM = SHA384.Create();
        var checksum = await shaM.ComputeHashAsync(openByte);
        return Convert.ToHexString(checksum);
    }

    public static string DecryptConnectionString(string connectionString)
    {
        var keyBytes = Convert.FromBase64String(KeyConnectionString);
        var ret = Decrypt2(Convert.FromBase64String(connectionString), keyBytes);
        return ret;
    }

    public static string EncryptConnectionString(string connectionString)
    {
        var keyBytes = Convert.FromBase64String(KeyConnectionString);
        var ret = Encrypt2(connectionString, keyBytes);
        return Convert.ToBase64String(ret);
    }

    public static string Encrypt(string plainText, byte[] key)
    {
        var enc = Encrypt2(plainText, key);
        var hexTxt = enc.ToStringHex();
        return hexTxt;
    }

    public static string Decrypt(string hexString, byte[] key)
    {
        var bytes = hexString.ToBytesFromHex();
        return Decrypt2(bytes, key);
    }


    public static byte[] Encrypt2(string plainText, byte[] key)
    {
        using var aes = Aes.Create();
        aes.GenerateIV();
        var maxKey = CreateSpecialByteArray(aes.Key.Length);
        Array.Copy(key, maxKey, aes.Key.Length);

        var encryptor = aes.CreateEncryptor(maxKey, aes.IV);
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using var sw = new StreamWriter(cs);
            sw.Write(plainText);
        }

        var enc = ms.ToArray();
        var encrypted = new byte[enc.Length + aes.IV.Length];

        Array.Copy(aes.IV, encrypted, aes.IV.Length);
        Array.Copy(enc, 0, encrypted, aes.IV.Length, enc.Length);
        return encrypted;
    }

    public static string Decrypt2(byte[] cipherText, byte[] key)
    {
        using var aes = Aes.Create();
        var maxKey = CreateSpecialByteArray(aes.Key.Length);
        Array.Copy(key, maxKey, aes.Key.Length);

        var iv = new byte[16];
        Array.Copy(cipherText, 0, iv, 0, iv.Length);

        var decrypt = aes.CreateDecryptor(maxKey, iv);

        var finalSize = Math.Abs(cipherText.Length - iv.Length);

        var finalText = new byte[finalSize];

        Array.Copy(cipherText, iv.Length, finalText, 0, finalSize);

        using var ms = new MemoryStream(finalText);
        using var cs = new CryptoStream(ms, decrypt, CryptoStreamMode.Read);
        using var reader = new StreamReader(cs);
        var plaintext = reader.ReadToEnd();
        return plaintext;
    }

    public static byte[] CreateSpecialByteArray(int length)
    {
        var arr = new byte[length];
        for (var i = 0; i < arr.Length; i++)
            arr[i] = 0x42;

        return arr;
    }
}
using System.Security.Cryptography;
using System.Text;

namespace Finnance.Api.Shared.Utils;

public static class HashHelper
{
    private const int NonceSize = 12;
    private const int TagSize = 16;
    private const int KeySize = 32;

    public static string ToBase64SHA384(this string openText)
    {
        var dataTxt = Encoding.ASCII.GetBytes(openText);
        return Convert.ToBase64String(SHA384.HashData(dataTxt));
    }

    public static string ToSHA384Hex(string hash)
    {
        var dataTxt = Encoding.ASCII.GetBytes(hash);
        using var memoryStream = new MemoryStream(dataTxt);
        return memoryStream.ToSHA384().Result;
    }

    public static async Task<string> ToSHA384(this Stream openByte)
    {
        using var shaM = SHA384.Create();
        var checksum = await shaM.ComputeHashAsync(openByte);
        return Convert.ToHexString(checksum);
    }

    public static string DecryptConnectionString(string encryptedConnectionString, string encryptionKey)
    {
        var key = ReadKey(encryptionKey);
        var payload = ReadPayload(encryptedConnectionString);
        var nonce = payload[..NonceSize];
        var tag = payload[NonceSize..(NonceSize + TagSize)];
        var ciphertext = payload[(NonceSize + TagSize)..];
        var plaintext = new byte[ciphertext.Length];

        try
        {
            using var aes = new AesGcm(key, TagSize);
            aes.Decrypt(nonce, ciphertext, tag, plaintext);
            return Encoding.UTF8.GetString(plaintext);
        }
        catch (AuthenticationTagMismatchException)
        {
            throw new InvalidOperationException(Constants.ErrorMessage.ConnectionStringConfigurationInvalid);
        }
    }

    public static string EncryptConnectionString(string connectionString, string encryptionKey)
    {
        if (connectionString.IsEmpty())
            throw new InvalidOperationException(Constants.ErrorMessage.ConnectionStringConfigurationInvalid);

        var key = ReadKey(encryptionKey);
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var plaintext = Encoding.UTF8.GetBytes(connectionString);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        var payload = new byte[nonce.Length + tag.Length + ciphertext.Length];
        Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, payload, nonce.Length, tag.Length);
        Buffer.BlockCopy(ciphertext, 0, payload, nonce.Length + tag.Length, ciphertext.Length);
        return Convert.ToBase64String(payload);
    }

    private static byte[] ReadKey(string encryptionKey)
    {
        try
        {
            var key = Convert.FromBase64String(encryptionKey ?? string.Empty);
            if (key.Length == KeySize) return key;
        }
        catch (FormatException)
        {
        }

        throw new InvalidOperationException(Constants.ErrorMessage.ConnectionStringConfigurationInvalid);
    }

    private static byte[] ReadPayload(string encryptedConnectionString)
    {
        try
        {
            var payload = Convert.FromBase64String(encryptedConnectionString ?? string.Empty);
            if (payload.Length > NonceSize + TagSize) return payload;
        }
        catch (FormatException)
        {
        }

        throw new InvalidOperationException(Constants.ErrorMessage.ConnectionStringConfigurationInvalid);
    }
}

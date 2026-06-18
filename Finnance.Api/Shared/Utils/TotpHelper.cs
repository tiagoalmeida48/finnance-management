using OtpNet;
using QRCoder;

namespace Finnance.Api.Shared.Utils;

public static class TotpHelper
{
    public static string GenerateSecretKey()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    public static bool ValidateCode(string secretKey, string userCode)
    {
        var totp = new Totp(Base32Encoding.ToBytes(secretKey));
        return totp.VerifyTotp(userCode, out _);
    }

    public static byte[] GenerateQRCode(string email, string secretKey)
    {
        var uri = $"otpauth://totp/{Constants.ProjectName}:{email}?secret={secretKey}&issuer={Constants.ProjectName}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(uri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrData);
        return qrCode.GetGraphic(20);
    }
}
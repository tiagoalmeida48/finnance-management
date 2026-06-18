namespace Finnance.Api.Shared.Utils;

public static class JwtConstants
{
    // Chave de assinatura HMAC-SHA256. Segue o padrao do projeto (constante local,
    // como HashHelper.KeyConnectionString). Trocar por valor de ambiente em producao.
    public const string SecretKey = "Fmg9rT2xQ7vK1pLs8dWzC4hN6bY0aJ3uE5oG7iR9kM2nP4qS6tU8wX1zB3dF5gH";
    public const int ExpirationHours = 8;
}

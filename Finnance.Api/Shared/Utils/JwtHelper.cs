using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Finnance.Api.Shared.Utils;

public class JwtHelper
{
    public const string NameIdentifier = "nameid";
    public const string ClaimLang = "lang";
    public const string ClaimTimeZone = "utc";
    public const string ClaimMfa = "mfa";
    public const string ClaimIsAdmin = "is_admin";
    public const string ClaimTokenVersion = "token_version";
    public const string ClaimPlatform = "WEB";

    public static string GenerateToken(List<Claim> claims, DateTime expiration, JwtSettings settings)
    {
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration.ToUniversalTime(),
            Issuer = settings.Issuer,
            Audience = settings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(settings.SecretKey.GetBytesFromText()),
                                                        SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static ClaimsPrincipal ValidateToken(string token, JwtSettings settings)
    {
        if (token.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(settings.SecretKey.GetBytesFromText()),
            ValidateIssuer = true,
            ValidIssuer = settings.Issuer,
            ValidateAudience = true,
            ValidAudience = settings.Audience,
            ValidateLifetime = true,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidTypes = ["JWT"],
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        var tokenHandler = new JwtSecurityTokenHandler { MapInboundClaims = false };

        try
        {
            var claims = tokenHandler.ValidateToken(token, tokenValidationParameters, out _);
            return claims;
        }
        catch (SecurityTokenExpiredException)
        {
            throw new ApplicationException(Constants.ErrorMessage.ExpiredToken);
        }
        catch (Exception)
        {
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);
        }
    }
}

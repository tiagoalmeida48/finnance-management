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
    public const string ClaimPlatform = "WEB";

    public static string GeraToken(List<Claim> claims, DateTime expiration, string key)
    {
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration.ToUniversalTime(),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key.GetBytesFromText()),
                                                        SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static ClaimsPrincipal ValidateToken(string token, string key)
    {
        if (token.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key.GetBytesFromText()),
            ValidateIssuer = false,
            ValidateAudience = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();

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
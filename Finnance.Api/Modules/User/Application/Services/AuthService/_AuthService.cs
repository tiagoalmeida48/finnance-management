using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public class AuthService(IUserService userSrv, IConfiguration configuration) : IAuthService
{
    private static readonly string DummyPasswordHash = Argon2Helper.GenerateHashPassword("invalid-password-placeholder");

    public SessionVo Login(string email, string password)
    {
        if (password.IsEmpty() || password.Length > 128)
            throw new ApplicationException(Constants.ErrorMessage.UserInvalidPassword);

        var user = userSrv.FindByEmail(email);
        var passwordHash = user?.PasswordHash ?? DummyPasswordHash;
        if (!Argon2Helper.VerifyPassword(password, passwordHash) || user == null)
            throw new ApplicationException(Constants.ErrorMessage.UserInvalidPassword);

        if (!user.Active || user.SubscriptionBlocked)
            throw new ApplicationException(Constants.ErrorMessage.UserInactive);

        if (!user.EmailVerified)
            throw new ApplicationException(Constants.ErrorMessage.EmailNotVerified);

        var language = user.Locale.IsEmpty() ? Constants.LanguageDefault : user.Locale;
        var claims = new List<Claim>
        {
            new(JwtHelper.NameIdentifier, user.User.ToString()),
            new(JwtHelper.ClaimLang, language),
            new(JwtHelper.ClaimTimeZone, Constants.TimeZoneDefault),
            new(JwtHelper.ClaimIsAdmin, user.IsAdmin.ToString()),
            new(JwtHelper.ClaimTokenVersion, user.TokenVersion.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
        };

        var settings = JwtSettings.From(configuration);
        var token = JwtHelper.GenerateToken(claims, DateTime.UtcNow.AddHours(settings.ExpirationHours), settings);

        return new SessionVo
        {
            Authenticated = true,
            Login = user.Email,
            User = user.User,
            Name = user.FullName,
            Token = token,
            Idiom = language,
            Platform = JwtHelper.ClaimPlatform,
            RequireMfa = false
        };
    }

    public MeDto Me(long user)
    {
        var entity = userSrv.Get(user);
        return new MeDto
        {
            User = entity.User,
            Email = entity.Email,
            FullName = entity.FullName,
            AvatarUrl = entity.AvatarUrl,
            Phone = entity.Phone,
            MarketingConsent = entity.MarketingConsent,
            MarketingConsentAt = entity.MarketingConsentAt,
            Currency = entity.Currency,
            Locale = entity.Locale,
            IsAdmin = entity.IsAdmin
        };
    }
}

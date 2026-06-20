using System.Security.Claims;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public class AuthService(IUserRoleService userRoleSrv,
                         IUserService userSrv) : IAuthService
{
    public SessionVo Login(string email, string password)
    {
        var user = userSrv.GetByEmail(email);
        if (!Argon2Helper.VerifyPassword(password, user.PasswordHash))
            throw new ApplicationException(Constants.ErrorMessage.UserInvalidPassword);

        var language = user.Locale.IsEmpty() ? Constants.LanguageDefault : user.Locale;
        var claims = new List<Claim>
        {
            new(JwtHelper.NameIdentifier, user.User.ToString()),
            new(JwtHelper.ClaimLang, language),
            new(JwtHelper.ClaimTimeZone, Constants.TimeZoneDefault),
        };

        var token = JwtHelper.GeraToken(claims, DateTime.UtcNow.AddHours(JwtConstants.ExpirationHours), JwtConstants.SecretKey);

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
        var roles = userRoleSrv.GetRoleIds(user);
        return new MeDto
        {
            User = entity.User,
            Email = entity.Email,
            FullName = entity.FullName,
            AvatarUrl = entity.AvatarUrl,
            Currency = entity.Currency,
            Locale = entity.Locale,
            Roles = roles,
            IsAdmin = roles.Contains(Constants.RoleId.ADMIN)
        };
    }
}

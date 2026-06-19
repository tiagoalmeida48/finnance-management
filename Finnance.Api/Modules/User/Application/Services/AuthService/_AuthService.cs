using System.Security.Claims;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public class AuthService(IUserRepository userRepository, IUserRoleRepository userRoleRepository) : IAuthService
{
    public SessionVo Login(string email, string password)
    {
        var user = userRepository.GetByEmail(email ?? string.Empty);
        if (user == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.EMAIL);

        if (!Argon2Helper.VerifyPassword(password ?? string.Empty, user.PasswordHash ?? string.Empty))
            throw new BusinessError(GeneralErrorNumber.USER_INVALID_PASSWORD, FieldName.PASSWORD);

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
        var entity = userRepository.GetByKey(new UserEntity { User = user });
        if (entity == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.USER);

        var roles = userRoleRepository.GetRoleCodesByUser(user).ToList();
        return new MeDto
        {
            User = entity.User,
            Email = entity.Email,
            FullName = entity.FullName,
            AvatarUrl = entity.AvatarUrl,
            Currency = entity.Currency,
            Locale = entity.Locale,
            Roles = roles,
            IsAdmin = roles.Contains(Constants.RoleCode.ADMIN)
        };
    }
}

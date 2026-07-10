using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IUserService : IBaseService<UserEntity>
{
    UserEntity Get(long user);
    UserEntity FindByEmail(string email);
    long CreateUser(UserEntity entity, string rawPassword, bool isAdmin);
    bool UpdateUser(UserEntity entity, bool isAdmin);
    bool UpdateOwnProfile(long user, string fullName, string avatarUrl);
    bool UpdateMarketingPreferences(long user, string phone, bool marketingConsent);
    bool UpdateUserPassword(long user, string rawPassword);
    bool UpdateOwnPassword(long user, string currentPassword, string rawPassword);
    bool RevokeSessions(long user);
    bool DeleteUser(long user, long currentUser);
    bool ToggleActive(long user, long currentUser);
    List<UserLightDto> ListManaged(bool includeInactive = false);
    void EnsureAdmin(long currentUser);
    UserEntity ProvisionFromPurchase(string email, string fullName, string phone);
    bool SyncPhoneFromPurchase(long user, string phone);
    bool ForgotPassword(string email);
    bool ResetPassword(string token, string rawPassword);
    string ExportData(long user);
}

using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IUserService : IBaseService<UserEntity>
{
    long CreateUser(UserEntity entity, string rawPassword, bool isAdmin);
    bool UpdateUser(UserEntity entity, bool isAdmin);
    bool UpdateUserPassword(long user, string rawPassword);
    bool DeleteUser(long user, long currentUser);
    List<UserLightDto> ListManaged();
    void EnsureAdmin(long currentUser);
}

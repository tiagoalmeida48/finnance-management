using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRepository : IBaseRepository<UserEntity>
{
    UserEntity GetByEmail(string email);
    bool ExistEmail(string email, long ignoreUser);
    bool UpdatePassword(long user, string passwordHash);
    bool DeleteUser(long user);
}

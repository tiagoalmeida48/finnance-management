using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRepository : IBaseRepository<UserEntity>
{
    List<UserEntity> Search(long user = 0,
                            string email = null,
                            bool active = false,
                            int quantity = 0);
}

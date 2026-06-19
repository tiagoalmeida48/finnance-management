using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IUserRoleRepository userRoleRepository)
    : BaseService<UserEntity>(userRepository), IUserService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IRoleRepository _roleRepository = roleRepository;
    private readonly IUserRoleRepository _userRoleRepository = userRoleRepository;
}

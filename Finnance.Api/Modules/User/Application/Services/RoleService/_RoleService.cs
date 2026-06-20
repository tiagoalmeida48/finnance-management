using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class RoleService(IRoleRepository roleRepository) : BaseService<RoleEntity>(roleRepository), IRoleService;

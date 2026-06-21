using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.SystemConfig.Application.Interfaces;
using Finnance.Api.Modules.SystemConfig.Domain.Entities;
using Finnance.Api.Modules.SystemConfig.Domain.Interfaces;

namespace Finnance.Api.Modules.SystemConfig.Application.Services;

public partial class SystemConfigService(ISystemConfigRepository systemConfigRepository) : BaseService<SystemConfigEntity>(systemConfigRepository), ISystemConfigService;

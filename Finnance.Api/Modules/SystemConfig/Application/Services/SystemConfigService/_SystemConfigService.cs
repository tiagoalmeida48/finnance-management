using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.SystemConfig.Application.Interfaces;
using Finnance.Api.Modules.SystemConfig.Domain.Entities;
using Finnance.Api.Modules.SystemConfig.Domain.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SystemConfig.Application.Services;

public partial class SystemConfigService(ISystemConfigRepository systemConfigRepository) : BaseService<SystemConfigEntity>(systemConfigRepository), ISystemConfigService
{
    public bool SetValue(string key, decimal value)
    {
        var current = GetByKey(key);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.SystemConfigNotFound);

        using var tran = GetTransaction();
        var updated = systemConfigRepository.SetValue(key, value);
        tran.Complete();

        return updated;
    }
}

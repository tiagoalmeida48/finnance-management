using Finnance.Api.Modules.SystemConfig.Domain.Entities;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SystemConfig.Application.Services;

public partial class SystemConfigService
{
    public List<SystemConfigEntity> List()
    {
        return systemConfigRepository.Search(active: true);
    }

    public SystemConfigEntity Get(long systemConfig)
    {
        var entity = systemConfigRepository.Search(systemConfig, active: true, quantity: 1).FirstOrDefault();

        if (entity == null)
            throw new ApplicationException(Constants.ErrorMessage.SystemConfigNotFound);

        return entity;
    }

    public SystemConfigEntity GetByKey(string key)
    {
        if (key.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        var entity = systemConfigRepository.GetByKey(key);

        if (entity == null)
            throw new ApplicationException(Constants.ErrorMessage.SystemConfigNotFound);

        return entity;
    }
}

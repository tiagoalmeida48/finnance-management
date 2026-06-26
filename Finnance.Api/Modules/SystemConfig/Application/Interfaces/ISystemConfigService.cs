using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.SystemConfig.Domain.Entities;

namespace Finnance.Api.Modules.SystemConfig.Application.Interfaces;

public interface ISystemConfigService : IBaseService<SystemConfigEntity>
{
    List<SystemConfigEntity> List();

    SystemConfigEntity Get(long systemConfig);

    SystemConfigEntity GetByKey(string key);

    bool SetValue(string key, decimal value);
}

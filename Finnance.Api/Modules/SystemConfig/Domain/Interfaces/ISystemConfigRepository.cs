using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.SystemConfig.Domain.Entities;

namespace Finnance.Api.Modules.SystemConfig.Domain.Interfaces;

public interface ISystemConfigRepository : IBaseRepository<SystemConfigEntity>
{
    List<SystemConfigEntity> Search(long systemConfig = 0,
                                    string key = null,
                                    bool active = false,
                                    int quantity = 0);

    SystemConfigEntity GetByKey(string key);

    bool SetValue(string key, decimal value);
}

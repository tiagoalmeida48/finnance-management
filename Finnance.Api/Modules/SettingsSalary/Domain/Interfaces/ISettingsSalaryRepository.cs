using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;

namespace Finnance.Api.Modules.SettingsSalary.Domain.Interfaces;

public interface ISettingsSalaryRepository : IBaseRepository<SettingsSalaryEntity>
{
    List<SettingsSalaryEntity> Search(long user = 0,
                                      long settingsSalary = 0,
                                      DateTime? coversDate = null,
                                      DateTime? dateEnd = null,
                                      bool active = false,
                                      int quantity = 0);
}

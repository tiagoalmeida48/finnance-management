using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;
using Finnance.Api.Modules.SettingsSalary.Domain.Interfaces;
using Finnance.Api.Modules.SettingsSalary.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.SettingsSalary.Repository.Repositories;

public class SettingsSalaryRepository : BaseRepository<SettingsSalaryEntity, SettingsSalaryMod>, ISettingsSalaryRepository
{
    public List<SettingsSalaryEntity> Search(long user = 0,
                                             long settingsSalary = 0,
                                             DateTime? coversDate = null,
                                             DateTime? dateEnd = null,
                                             bool active = false,
                                             int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM settings_salary WHERE 1 = 1 ");

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (settingsSalary > 0)
        {
            param.Add("settingsSalary", settingsSalary);
            sb.Append("AND settings_salary = @settingsSalary ");
        }

        if (coversDate.HasValue)
        {
            param.Add("coversDate", coversDate.Value);
            sb.Append("AND date_start <= @coversDate AND date_end >= @coversDate ");
        }

        if (dateEnd.HasValue)
        {
            param.Add("dateEnd", dateEnd.Value);
            sb.Append("AND date_end = @dateEnd ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY date_start DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<SettingsSalaryMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}

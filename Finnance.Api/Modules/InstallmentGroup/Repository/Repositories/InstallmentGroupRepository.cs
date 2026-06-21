using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Modules.InstallmentGroup.Domain.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.InstallmentGroup.Repository.Repositories;

public class InstallmentGroupRepository : BaseRepository<InstallmentGroupEntity, InstallmentGroupMod>, IInstallmentGroupRepository
{
    public List<InstallmentGroupEntity> Search(long installmentGroup = 0,
                                               long user = 0,
                                               bool active = false,
                                               int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM installment_group WHERE 1 = 1 ");

        if (installmentGroup > 0)
        {
            param.Add("installmentGroup", installmentGroup);
            sb.Append("AND installment_group = @installmentGroup ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<InstallmentGroupMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}

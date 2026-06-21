using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.CategoryType.Domain.Entities;
using Finnance.Api.Modules.CategoryType.Domain.Interfaces;
using Finnance.Api.Modules.CategoryType.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.CategoryType.Repository.Repositories;

public class CategoryTypeRepository : BaseRepository<CategoryTypeEntity, CategoryTypeMod>, ICategoryTypeRepository
{
    public List<CategoryTypeEntity> Search(long categoryType = 0,
                                           string name = null,
                                           bool active = false,
                                           int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM category_type WHERE 1 = 1 ");

        if (categoryType > 0)
        {
            param.Add("categoryType", categoryType);
            sb.Append("AND category_type = @categoryType ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CategoryTypeMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}

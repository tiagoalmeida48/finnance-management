using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Category.Domain.Entities;
using Finnance.Api.Modules.Category.Domain.Interfaces;
using Finnance.Api.Modules.Category.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.Category.Repository.Repositories;

public class CategoryRepository : BaseRepository<CategoryEntity, CategoryMod>, ICategoryRepository
{
    public List<CategoryEntity> Search(long user = 0,
                                       long category = 0,
                                       long categoryType = 0,
                                       string name = null,
                                       bool active = false,
                                       int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM category WHERE 1 = 1 ");
        sb.Append(GetTenantClause());
        TenantParams(param);

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (category > 0)
        {
            param.Add("category", category);
            sb.Append("AND category = @category ");
        }

        if (categoryType > 0)
        {
            param.Add("categoryType", categoryType);
            sb.Append("AND category_type = @categoryType ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("""AND LOWER("name") = LOWER(@name) """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("""ORDER BY category_type, LOWER("name") """);

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CategoryMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}

using Dapper;
using Npgsql;
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using System.Data;

namespace Finnance.Api.Modules.Common.Repository;

public partial class BaseRepository<TEntity, TModel> : IBaseRepository<TEntity>
    where TEntity : BaseEntity
    where TModel : BaseModel
{
    protected readonly string _ConnStr;
    protected readonly ApiContextVo ApiContext;
    protected readonly string Schema;

    protected static bool IsUserOwned => typeof(IUserOwned).IsAssignableFrom(typeof(TEntity));

    protected string TenantClause => IsUserOwned ? """ AND "user" = @__tenant """ : string.Empty;

    protected DynamicParameters TenantParams(TModel model)
    {
        var param = new DynamicParameters(model);
        param.Add("__tenant", ApiContext.User);
        return param;
    }

    protected BaseRepository()
    {
        var apiContext = ServiceLocator.GetInstance<ApiContextVo>();
        _ConnStr = apiContext.Conn.RemoveFrom("sch");
        ApiContext = apiContext;

        var arrParam = apiContext.Conn.Split(';');
        var schemaTemp = arrParam.FirstOrDefault(a => a.StartsWith("sch"));
        if (schemaTemp == null) return;

        arrParam = schemaTemp.Split('=');
        Schema = arrParam.Length > 1 ? arrParam[1] + "." : string.Empty;
    }

    protected IDbConnection Conn => new NpgsqlConnection(_ConnStr);

    protected TModel MapToModel(TEntity entity)
    {
        return entity?.MapTo<TModel>();
    }

    protected TEntity MapToEntity(TModel model)
    {
        return model?.MapTo<TEntity>();
    }

    protected List<TEntity> MapToEntity(List<TModel> models)
    {
        return models?.Select(MapToEntity).ToList();
    }

    protected List<TModel> MapToModel(List<TEntity> entities)
    {
        return entities?.Select(MapToModel).ToList();
    }
}
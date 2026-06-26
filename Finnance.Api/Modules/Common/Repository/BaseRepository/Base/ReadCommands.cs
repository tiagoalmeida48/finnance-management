using Dapper;
using Dapper.Contrib.Extensions;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;
using System.Reflection;
using System.Text;

namespace Finnance.Api.Modules.Common.Repository;

public partial class BaseRepository<TEntity, TModel>
{
    public TEntity GetByKey(TEntity entity)
    {
        var model = MapToModel(entity);
        var selFrom = EntityHelper.GetSelectFrom<TModel>(Schema);
        var where = EntityHelper.GetWhereByKey<TModel>() + TenantClause;

        using var con = Conn;
        var result = con.QueryFirstOrDefault<TModel>($"{selFrom}{where}", IsUserOwned ? TenantParams(model) : model);
        return result != null ? MapToEntity(result) : null;
    }

    public IEnumerable<TEntity> All()
    {
        var selFrom = EntityHelper.GetSelectFrom<TModel>(Schema);
        using var con = Conn;

        if (IsUserOwned)
        {
            var scoped = con.Query<TModel>($"""{selFrom} WHERE "user" = @__tenant """, new { __tenant = ApiContext.User });
            return scoped.Select(MapToEntity);
        }

        var models = con.Query<TModel>(selFrom);
        return models.Select(MapToEntity);
    }

    public bool Exist(TEntity entity)
    {
        var model = MapToModel(entity);
        var tb = EntityHelper.GetTableName<TModel>(Schema);
        var where = EntityHelper.GetWhereByKey<TModel>() + TenantClause;

        var qr = $"SELECT COUNT(*) FROM {tb} {where}";
        using var con = Conn;
        return con.ExecuteScalar<long>(qr, IsUserOwned ? TenantParams(model) : model) > 0;
    }

    public IEnumerable<(string table, long quant)> GetReference(TEntity entity)
    {
        var model = MapToModel(entity);
        return GetReference(model);
    }

    public string GetTableName(string table)
    {
        var query = $"""
                     SELECT TT.DESCRIPTION FROM {Schema}base_table T 
                     INNER JOIN {Schema}base_table_text TT ON TT.TABLE = T.TABLE AND TT.IDIOM = @Language
                     WHERE T.TABLE = @table LIMIT 1
                     """;

        using var con = Conn;
        return con.QueryFirstOrDefault<string>(query, new { table, ApiContext.Language });
    }

    public IEnumerable<(string table, long quant)> GetReference(TModel model)
    {
        var fullName = GetTableName<TModel>();
        var tName = (fullName.Contains('.') ? fullName.Split('.')[^1] : fullName).Trim('"');

        const string query = """
                             SELECT tc.table_name AS reference_table,
                                    kcu.column_name AS column_name,
                                    ccu.column_name AS reference_column
                                FROM information_schema.table_constraints tc
                                JOIN  information_schema.key_column_usage AS kcu
                                    ON tc.constraint_name = kcu.constraint_name
                                    AND tc.table_schema = kcu.table_schema
                                JOIN information_schema.constraint_column_usage AS ccu
                                    ON ccu.constraint_schema = tc.constraint_schema
                                    AND ccu.constraint_name = tc.constraint_name
                                    AND ccu.column_name = kcu.column_name
                                WHERE tc.constraint_type = 'FOREIGN KEY'
                                    AND ccu.table_name = @tName
                                    AND ccu.table_schema = @schema;
                             """;

        using var con = Conn;
        var sbCheckRef = new StringBuilder();
        var sbColsRef = new StringBuilder();

        var schema = Schema.IsEmpty() ? "public" : Schema.Replace(".", string.Empty).Trim('"');
        var resGeneral = con.Query<(string table, string field, string refField)>(query, new { schema, tName });
        if (resGeneral.IsEmpty()) return null;

        var daughterTables = resGeneral.DistinctBy(t => t.table).ToList();
        var dyParams = new DynamicParameters();

        for (var i = 0; i < daughterTables.Count; i++)
        {
            var (table, field, refField) = daughterTables[i];

            var columnsByTable = resGeneral.Where(t => t.table == table).ToList();

            sbColsRef.Clear();

            for (var y = 0; y < columnsByTable.Count; y++)
            {
                var col = columnsByTable[y];

                var currentValue = model.GetValueFromField(col.refField);
                var nameParam = $"@p{col.refField}{i}{y}";

                sbColsRef.Append($"\"{col.refField}\" = {nameParam} AND ");
                dyParams.Add(nameParam, currentValue);
            }

            sbColsRef.Remove(sbColsRef.Length - 5, 4);

            var sel = $"SELECT '{table}' TABELA, COUNT(1) QUANT FROM {Schema}\"{table}\" WHERE {sbColsRef} UNION ALL ";
            sbCheckRef.Append(sel);
        }

        sbCheckRef.Remove(sbCheckRef.Length - 11, 10);

        var references = con.Query<(string tab, long quant)>(sbCheckRef.ToString(), dyParams);

        return references;

    }

    public void GetExplicitKeyValue(TModel model)
    {
        var type = typeof(TModel);
        var props = type.GetProperties();

        foreach (var prop in props)
        {
            if (prop.GetCustomAttribute<ExplicitKeyAttribute>() == null) continue;

            var value = prop.GetValue(model)?.ToString();
            if (value != null && value.ContainsSpecialCharacters())
                throw new ApplicationException(Constants.ErrorMessage.CannotSpecialCharacterInField);
        }
    }

    public long Count()
    {
        var qr = $"SELECT COUNT(*) FROM {EntityHelper.GetTableName<TModel>(Schema)}";
        using var con = Conn;
        return con.ExecuteScalar<long>(qr);
    }

    public string GetTableName<Y>() where Y : BaseModel
    {
        return EntityHelper.GetTableName<Y>(Schema);
    }

    protected Paginator<TEntity> QueryPaginated(string select, string from, string ord, DynamicParameters param, PaginatorParam paginatorParam)
    {
        var pageSize = paginatorParam?.PageSize ?? Constants.MaxPageSizeLimit;
        var initialRegistration = Math.Max(0, paginatorParam?.InitialRegistration ?? 0);

        param.Add("@initialRegistration", initialRegistration);
        param.Add("@pageSize", pageSize);

        var combinedQuery = $"""
                             SELECT COUNT(1) {from};
                             {select} {from} {ord} LIMIT @pageSize OFFSET @initialRegistration;
                             """;

        using var con = Conn;
        using var multi = con.QueryMultiple(combinedQuery, param);

        var totalDto = multi.ReadSingle<int>();
        var data = multi.Read<TModel>().ToList();

        var dataPaginator = new Paginator<TEntity>
        {
            TotalDto = totalDto,
            Pages = MapToEntity(data),
            PageSize = data.Count,
            TotalPages = (int)Math.Ceiling(totalDto / (double)pageSize)
        };

        return dataPaginator;
    }

    protected string OrdinationQueryPaginated(string select, PaginatorParam paginatorParam, string columnDefault)
    {
        if (paginatorParam == null || paginatorParam.Order.IsEmpty())
            return $"ORDER BY {columnDefault} ASC ";

        var ordination = paginatorParam.Order.MapTo<OrdinationParam>();
        return ordination.GetColumnsOrderBy<TModel>(select);
    }

    private TModel GetDataModelBase(TModel model)
    {
        using var con = Conn;
        var sel = EntityHelper.GetSelectDates<TModel>(Schema) + TenantClause;
        var result = con.QueryFirstOrDefault<TModel>(sel, IsUserOwned ? TenantParams(model) : model);
        if (result == null)
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);
        return result;
    }
}
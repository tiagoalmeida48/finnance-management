using Dapper;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Common.Repository;

public partial class BaseRepository<TEntity, TModel>
{
    public long Create(TEntity entity)
    {
        entity.Created = entity.Updated = DateTime.Now;
        var model = MapToModel(entity);

        var autoKey = EntityHelper.IsAutoKey<TModel>();
        long ret;

        using var con = Conn;
        if (autoKey)
        {
            var insert = EntityHelper.GetInsertAutoKey<TModel>(Schema);
            ret = con.ExecuteScalar<long>(insert, model);
        }
        else
        {
            GetExplicitKeyValue(model);
            var insert = EntityHelper.GetInsert<TModel>(Schema);
            ret = con.Execute(insert, model);
        }

        return ret;
    }

    public bool Update(TEntity entity)
    {
        entity.Updated = DateTime.Now;
        var model = MapToModel(entity);

        using var con = Conn;
        var upd = EntityHelper.GetUpdate<TModel>(Schema);
        var old = GetDataModelBase(model);
        model.Created = old.Created;
        return con.Execute(upd, model) > 0;
    }

    public bool Delete(TEntity entity)
    {
        var model = MapToModel(entity);
        var refs = GetReference(model);
        if (refs != null)
        {
            var (table, _) = refs.FirstOrDefault(t => t.quant > 0);
            if (table.IsNotEmpty())
                throw new BusinessError(GeneralErrorNumber.PENDING_REGISTRATION_ANOTHER_TABLE, msgParam: GetTableName(table) ?? table);
        }

        var del = EntityHelper.GetDelete<TModel>(Schema);
        using var con = Conn;
        return con.Execute(del, model) > 0;
    }

    public bool CreateBatch(IEnumerable<TEntity> entities)
    {
        if (entities.IsEmpty()) return false;

        var models = MapToModel(entities);
        var (inserts, parameters) = models.GenerateInserts(Schema);

        using var con = Conn;
        using var tran = con.BeginTransaction();

        try
        {
            con.Execute(inserts.ToString(), parameters);
            tran.Commit();
            return true;
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }

    public bool UpdateBatch(IEnumerable<TEntity> entities)
    {
        if (entities.IsEmpty()) return false;

        var models = MapToModel(entities);
        var (updates, parameters) = models.GenerateUpdates(Schema);

        using var con = Conn;
        using var tran = con.BeginTransaction();

        try
        {
            con.Execute(updates.ToString(), parameters);
            tran.Commit();
            return true;
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }

    public bool DeleteBatch(IEnumerable<TEntity> entities)
    {
        if (entities.IsEmpty()) return false;

        var models = MapToModel(entities);

        Parallel.ForEach(models, model =>
        {
            var refs = GetReference(model);
            if (refs == null) return;

            var (table, _) = refs.FirstOrDefault(t => t.quant > 0);
            if (table.IsNotEmpty())
                throw new BusinessError(GeneralErrorNumber.PENDING_REGISTRATION_ANOTHER_TABLE, msgParam: GetTableName(table) ?? table);
        });

        var (deletes, parameters) = models.GenerateDeletes(Schema);

        using var con = Conn;
        using var tran = con.BeginTransaction();

        try
        {
            con.Execute(deletes.ToString(), parameters);
            tran.Commit();
            return true;
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }
}
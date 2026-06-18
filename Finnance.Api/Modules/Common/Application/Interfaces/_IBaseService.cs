using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Common.Application.Interfaces;

public interface IBaseService<T> where T : BaseEntity
{
    IEnumerable<T> All();
    T GetByKey(T key);
    bool Exist(T entity);

    bool Delete(T entity);

    bool CreateBatch(IEnumerable<T> entities);
    bool UpdateBatch(IEnumerable<T> entities);
    bool DeleteBatch(IEnumerable<T> entities);

    IEnumerable<(string table, long quant)> GetReference(T entity);
}
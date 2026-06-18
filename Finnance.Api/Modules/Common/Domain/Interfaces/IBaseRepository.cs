using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Common.Domain.Interfaces;

public interface IBaseRepository<T> where T : BaseEntity
{
    bool Exist(T item);
    T GetByKey(T key);
    IEnumerable<(string table, long quant)> GetReference(T model);
    IEnumerable<T> All();

    long Create(T model);
    bool CreateBatch(IEnumerable<T> items);

    bool Update(T model);
    bool UpdateBatch(IEnumerable<T> items);

    bool Delete(T model);
    bool DeleteBatch(IEnumerable<T> items);
}
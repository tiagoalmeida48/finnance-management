namespace Finnance.Api.Modules.Common.Application.Services;

public abstract partial class BaseService<T>
{
    public bool Exist(T entity)
    {
        return baseRepository.Exist(entity);
    }

    public IEnumerable<T> All()
    {
        return baseRepository.All();
    }

    public T GetByKey(T key)
    {
        return baseRepository.GetByKey(key);
    }

    public IEnumerable<(string table, long quant)> GetReference(T entity)
    {
        var refs = baseRepository.GetReference(entity);
        return refs;
    }
}
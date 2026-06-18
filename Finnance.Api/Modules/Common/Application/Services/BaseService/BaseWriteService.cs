namespace Finnance.Api.Modules.Common.Application.Services;

public abstract partial class BaseService<T>
{
    public bool Delete(T entity)
    {
        return baseRepository.Delete(entity);
    }

    public bool CreateBatch(IEnumerable<T> entities)
    {
        return baseRepository.CreateBatch(entities);
    }

    public bool UpdateBatch(IEnumerable<T> entities)
    {
        return baseRepository.UpdateBatch(entities);
    }

    public bool DeleteBatch(IEnumerable<T> entities)
    {
        return baseRepository.DeleteBatch(entities);
    }
}
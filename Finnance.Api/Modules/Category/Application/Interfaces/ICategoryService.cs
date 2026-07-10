using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Category.Domain.Entities;

namespace Finnance.Api.Modules.Category.Application.Interfaces;

public interface ICategoryService : IBaseService<CategoryEntity>
{
    CategoryEntity Get(long category, long userId);
    List<CategoryEntity> List(long userId, bool includeInactive = false);
    long CreateCategory(CategoryEntity entity, long userId);
    bool UpdateCategory(CategoryEntity entity, long userId);
    bool DeleteCategory(long category, long userId);
    bool ToggleActive(long category, long userId);
}

using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Category.Application.Interfaces;
using Finnance.Api.Modules.Category.Domain.Entities;
using Finnance.Api.Modules.Category.Domain.Interfaces;

namespace Finnance.Api.Modules.Category.Application.Services;

public partial class CategoryService(ICategoryRepository categoryRepository) : BaseService<CategoryEntity>(categoryRepository), ICategoryService
{
    public long CreateCategory(CategoryEntity entity, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();
        ValidateNameUnique(userId, entity.CategoryType, entity.Name, 0);

        using var tran = GetTransaction();
        var categoryId = categoryRepository.Create(entity);
        tran.Complete();
        return categoryId;
    }

    public bool UpdateCategory(CategoryEntity entity, long userId)
    {
        entity.ValidateUpdate();

        var current = Get(entity.Category, userId);
        ValidateNameUnique(userId, entity.CategoryType, entity.Name, entity.Category);

        current.CategoryType = entity.CategoryType;
        current.Name = entity.Name;
        current.Color = entity.Color;
        current.Icon = entity.Icon;
        current.Active = entity.Active;

        using var tran = GetTransaction();
        categoryRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool DeleteCategory(long category, long userId)
    {
        var current = Get(category, userId);
        current.Active = false;

        using var tran = GetTransaction();
        categoryRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool ToggleActive(long category, long userId)
    {
        var current = Get(category, userId);
        if (!current.Active)
            ValidateNameUnique(userId, current.CategoryType, current.Name, current.Category);
        current.Active = !current.Active;

        using var tran = GetTransaction();
        categoryRepository.Update(current);
        tran.Complete();

        return true;
    }
}

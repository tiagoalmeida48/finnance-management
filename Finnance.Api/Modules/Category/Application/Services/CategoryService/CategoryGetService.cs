using Finnance.Api.Modules.Category.Domain.Entities;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Category.Application.Services;

public partial class CategoryService
{
    public CategoryEntity Get(long category, long userId)
    {
        var current = categoryRepository.Search(category: category, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.CategoryNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }

    public List<CategoryEntity> List(long userId)
    {
        return categoryRepository.Search(user: userId, active: true);
    }
}

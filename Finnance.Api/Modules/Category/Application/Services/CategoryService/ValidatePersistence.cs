using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Category.Application.Services;

public partial class CategoryService
{
    private void ValidateNameUnique(long userId, long categoryType, string name, long ignoreCategory)
    {
        var existing = categoryRepository.Search(user: userId, categoryType: categoryType, name: name, active: true);
        if (existing.Any(c => c.Category != ignoreCategory))
            throw new ApplicationException(Constants.ErrorMessage.CategoryAlreadyExists);
    }
}

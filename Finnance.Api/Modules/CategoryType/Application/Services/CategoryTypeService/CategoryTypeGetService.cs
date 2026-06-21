using Finnance.Api.Modules.CategoryType.Domain.Entities;

namespace Finnance.Api.Modules.CategoryType.Application.Services;

public partial class CategoryTypeService
{
    public List<CategoryTypeEntity> List()
    {
        return categoryTypeRepository.Search(active: true);
    }

    public CategoryTypeEntity Get(long categoryType)
    {
        return categoryTypeRepository.Search(categoryType, active: true, quantity: 1).FirstOrDefault();
    }

    public bool Exist(long categoryType)
    {
        return Get(categoryType) != null;
    }
}

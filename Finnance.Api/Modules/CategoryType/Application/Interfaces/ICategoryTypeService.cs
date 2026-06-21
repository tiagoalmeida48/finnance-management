using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.CategoryType.Domain.Entities;

namespace Finnance.Api.Modules.CategoryType.Application.Interfaces;

public interface ICategoryTypeService : IBaseService<CategoryTypeEntity>
{
    List<CategoryTypeEntity> List();

    CategoryTypeEntity Get(long categoryType);

    bool Exist(long categoryType);
}

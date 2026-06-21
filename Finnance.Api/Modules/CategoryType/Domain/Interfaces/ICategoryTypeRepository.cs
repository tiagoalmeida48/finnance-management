using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.CategoryType.Domain.Entities;

namespace Finnance.Api.Modules.CategoryType.Domain.Interfaces;

public interface ICategoryTypeRepository : IBaseRepository<CategoryTypeEntity>
{
    List<CategoryTypeEntity> Search(long categoryType = 0,
                                    string name = null,
                                    bool active = false,
                                    int quantity = 0);
}

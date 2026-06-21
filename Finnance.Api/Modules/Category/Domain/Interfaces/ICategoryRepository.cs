using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Category.Domain.Entities;

namespace Finnance.Api.Modules.Category.Domain.Interfaces;

public interface ICategoryRepository : IBaseRepository<CategoryEntity>
{
    List<CategoryEntity> Search(long user = 0,
                                long category = 0,
                                long categoryType = 0,
                                string name = null,
                                bool active = false,
                                int quantity = 0);
}

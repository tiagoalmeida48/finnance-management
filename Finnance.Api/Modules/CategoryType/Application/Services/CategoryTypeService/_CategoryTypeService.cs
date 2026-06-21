using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CategoryType.Application.Interfaces;
using Finnance.Api.Modules.CategoryType.Domain.Entities;
using Finnance.Api.Modules.CategoryType.Domain.Interfaces;

namespace Finnance.Api.Modules.CategoryType.Application.Services;

public partial class CategoryTypeService(ICategoryTypeRepository categoryTypeRepository) : BaseService<CategoryTypeEntity>(categoryTypeRepository), ICategoryTypeService;

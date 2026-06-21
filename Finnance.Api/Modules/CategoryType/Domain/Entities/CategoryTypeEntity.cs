using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CategoryType.Domain.Entities;

public class CategoryTypeEntity : BaseEntity
{
    public long CategoryType { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}

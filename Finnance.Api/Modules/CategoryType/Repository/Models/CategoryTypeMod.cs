using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CategoryType.Repository.Models;

[Table("category_type")]
public class CategoryTypeMod : BaseModel
{
    [Key]
    [Column("category_type")]
    public long CategoryType { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}

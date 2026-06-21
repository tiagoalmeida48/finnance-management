using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Category.Repository.Models;

[Table("category")]
public class CategoryMod : BaseModel
{
    [Key]
    [Column("category")]
    public long Category { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("category_type")]
    public long CategoryType { get; set; }

    [Column("\"name\"")]
    public string Name { get; set; }

    [Column("color")]
    public string Color { get; set; }

    [Column("icon")]
    public string Icon { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}

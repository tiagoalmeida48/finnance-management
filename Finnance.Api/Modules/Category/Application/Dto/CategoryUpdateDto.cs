namespace Finnance.Api.Modules.Category.Application.Dto;

public class CategoryUpdateDto
{
    public long Category { get; set; }

    public string Name { get; set; }

    public long CategoryType { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public bool Active { get; set; }
}

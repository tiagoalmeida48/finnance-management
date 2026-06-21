namespace Finnance.Api.Modules.Category.Application.Dto;

public class CategoryCreateDto
{
    public string Name { get; set; }

    public long CategoryType { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }
}

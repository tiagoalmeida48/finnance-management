using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.Category.Application.Dto;
using Finnance.Api.Modules.Category.Application.Interfaces;
using Finnance.Api.Modules.Category.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CategoryController(ICategoryService categoryService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<CategoryDisplayDto>> List()
    {
        var categories = categoryService.List(UserLogged.user);
        return new ResultApi<List<CategoryDisplayDto>> { Result = categories.MapTo<List<CategoryDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<CategoryDisplayDto> Get([FromQuery] long category)
    {
        var entity = categoryService.Get(category, UserLogged.user);
        return new ResultApi<CategoryDisplayDto> { Result = entity.MapTo<CategoryDisplayDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> Create([FromBody] CategoryCreateDto dto)
    {
        var entity = new CategoryEntity
        {
            Name = dto.Name,
            CategoryType = dto.CategoryType,
            Color = dto.Color,
            Icon = dto.Icon
        };
        var id = categoryService.CreateCategory(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] CategoryUpdateDto dto)
    {
        var entity = new CategoryEntity
        {
            Category = dto.Category,
            Name = dto.Name,
            CategoryType = dto.CategoryType,
            Color = dto.Color,
            Icon = dto.Icon,
            Active = dto.Active
        };
        return new ResultApi<bool> { Result = categoryService.UpdateCategory(entity, UserLogged.user) };
    }

    [Authorization()]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long category)
    {
        return new ResultApi<bool> { Result = categoryService.DeleteCategory(category, UserLogged.user) };
    }
}

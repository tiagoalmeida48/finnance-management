using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.CategoryType.Application.Dto;
using Finnance.Api.Modules.CategoryType.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CategoryTypeController(ICategoryTypeService categoryTypeService) : ControllerBase
{
    [Authorization]
    [HttpGet]
    public ResultApi<List<CategoryTypeDisplayDto>> List()
    {
        return new ResultApi<List<CategoryTypeDisplayDto>> { Result = categoryTypeService.List().MapTo<List<CategoryTypeDisplayDto>>() };
    }

    [Authorization]
    [HttpGet]
    public ResultApi<CategoryTypeDisplayDto> Get([FromQuery] long id)
    {
        return new ResultApi<CategoryTypeDisplayDto> { Result = categoryTypeService.Get(id).MapTo<CategoryTypeDisplayDto>() };
    }
}

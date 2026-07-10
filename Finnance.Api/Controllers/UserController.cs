using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class UserController(IUserService userService) : ControllerBase
{
    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<UserLightDto>> List([FromQuery] bool includeInactive = false)
    {
        return new ResultApi<List<UserLightDto>> { Result = userService.ListManaged(includeInactive) };
    }

    [Authorization(admin: true)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] UserCreateDto dto)
    {
        var entity = new UserEntity { Email = dto.Email, FullName = dto.FullName };
        var id = userService.CreateUser(entity, dto.Password, dto.IsAdmin);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] UserUpdateDto dto)
    {
        var entity = new UserEntity { User = dto.User, Email = dto.Email, FullName = dto.FullName };
        return new ResultApi<bool> { Result = userService.UpdateUser(entity, dto.IsAdmin) };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> UpdatePassword([FromBody] UserUpdatePasswordDto dto)
    {
        return new ResultApi<bool> { Result = userService.UpdateUserPassword(dto.User, dto.Password) };
    }

    [Authorization(admin: true)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long user)
    {
        return new ResultApi<bool> { Result = userService.DeleteUser(user, UserLogged.user) };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> ToggleActive([FromBody] long user)
    {
        return new ResultApi<bool> { Result = userService.ToggleActive(user, UserLogged.user) };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<string> ExportData()
    {
        return new ResultApi<string> { Result = userService.ExportData(UserLogged.user) };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> UpdateProfile([FromBody] UserUpdateProfileDto dto)
    {
        return new ResultApi<bool> { Result = userService.UpdateOwnProfile(UserLogged.user, dto?.FullName, dto?.AvatarUrl) };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> UpdateMyPassword([FromBody] UserUpdateOwnPasswordDto dto)
    {
        return new ResultApi<bool> { Result = userService.UpdateUserPassword(UserLogged.user, dto?.Password) };
    }
}

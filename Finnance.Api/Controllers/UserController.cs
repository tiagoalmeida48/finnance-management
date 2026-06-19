using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class UserController(IUserService userService) : ControllerBase
{
    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.READ)]
    [HttpGet]
    public ResultApi<List<UserLightDto>> List()
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<List<UserLightDto>> { Result = userService.ListManaged() };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.CREATE)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] UserCreateDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        var entity = new UserEntity { Email = dto.Email, FullName = dto.FullName };
        var id = userService.CreateUser(entity, dto.Password, dto.IsAdmin);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.UPDATE)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] UserUpdateDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        var entity = new UserEntity { User = dto.User, Email = dto.Email, FullName = dto.FullName };
        return new ResultApi<bool> { Result = userService.UpdateUser(entity, dto.IsAdmin) };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.UPDATE)]
    [HttpPut]
    public ResultApi<bool> UpdatePassword([FromBody] UserUpdatePasswordDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<bool> { Result = userService.UpdateUserPassword(dto.User, dto.Password) };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.DELETE)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long user)
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<bool> { Result = userService.DeleteUser(user, UserLogged.user) };
    }
}

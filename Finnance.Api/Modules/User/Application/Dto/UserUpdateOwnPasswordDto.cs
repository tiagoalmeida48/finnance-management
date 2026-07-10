namespace Finnance.Api.Modules.User.Application.Dto;

public class UserUpdateOwnPasswordDto
{
    public string CurrentPassword { get; set; }

    public string Password { get; set; }
}

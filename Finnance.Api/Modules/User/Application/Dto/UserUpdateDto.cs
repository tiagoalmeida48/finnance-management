namespace Finnance.Api.Modules.User.Application.Dto;

public class UserUpdateDto
{
    public long User { get; set; }

    public string Email { get; set; }

    public string FullName { get; set; }

    public bool IsAdmin { get; set; }
}

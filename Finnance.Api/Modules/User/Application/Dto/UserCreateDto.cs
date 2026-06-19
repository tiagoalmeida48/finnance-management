namespace Finnance.Api.Modules.User.Application.Dto;

public class UserCreateDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public bool IsAdmin { get; set; }
}

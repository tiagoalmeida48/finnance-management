namespace Finnance.Api.Modules.User.Application.Dto;

public class ResetPasswordDto
{
    public string Token { get; set; }

    public string Password { get; set; }
}

namespace Finnance.Api.Modules.User.Application.Dto;

public class MeDto
{
    public long User { get; set; }

    public string Email { get; set; }

    public string FullName { get; set; }

    public string AvatarUrl { get; set; }

    public string Currency { get; set; }

    public string Locale { get; set; }

    public bool IsAdmin { get; set; }
}

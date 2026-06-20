namespace Finnance.Api.Modules.User.Application.Dto;

public class UserDisplayDto : UserLightDto
{
    public string AvatarUrl { get; set; }

    public string Currency { get; set; }

    public string Locale { get; set; }

    public bool Active { get; set; }
}

namespace Finnance.Api.Modules.User.Application.Dto;

public class SessionDto
{
    public string Token { get; set; }

    public long User { get; set; }

    public string Name { get; set; }

    public bool Authenticated { get; set; }

    public string Idiom { get; set; }
}

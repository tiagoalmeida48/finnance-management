namespace Finnance.Api.Modules.Common.Domain.Vo;

public class UpdatePasswordVo
{
    public long User { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}
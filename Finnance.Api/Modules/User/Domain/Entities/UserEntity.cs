using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class UserEntity : BaseEntity
{
    public long User { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string AvatarUrl { get; set; }
    public string Currency { get; set; }
    public string Locale { get; set; }
    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (Email.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.EMAIL);
    }

    public override void ValidateUpdate()
    {
        if (User <= 0)
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.USER);
        if (Email.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.EMAIL);
    }
}

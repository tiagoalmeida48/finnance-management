using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("\"user\"")]
public class UserMod : BaseModel
{
    [Key] public long User { get; set; }
    [Column("email")] public string Email { get; set; }
    [Column("password_hash")] public string PasswordHash { get; set; }
    [Column("full_name")] public string FullName { get; set; }
    [Column("avatar_url")] public string AvatarUrl { get; set; }
    [Column("currency")] public string Currency { get; set; }
    [Column("locale")] public string Locale { get; set; }
    [Column("active")] public bool Active { get; set; }
}

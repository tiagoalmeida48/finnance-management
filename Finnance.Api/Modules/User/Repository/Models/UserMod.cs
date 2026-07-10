using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("\"user\"")]
public class UserMod : BaseModel
{
    [Key]
    [Column("\"user\"")]
    public long User { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("password_hash")]
    public string PasswordHash { get; set; }

    [Column("full_name")]
    public string FullName { get; set; }

    [Column("avatar_url")]
    public string AvatarUrl { get; set; }

    [Column("phone")]
    public string Phone { get; set; }

    [Column("marketing_consent")]
    public bool MarketingConsent { get; set; }

    [Column("marketing_consent_at")]
    public DateTime? MarketingConsentAt { get; set; }

    [Column("marketing_consent_source")]
    public string MarketingConsentSource { get; set; }

    [Column("marketing_consent_version")]
    public string MarketingConsentVersion { get; set; }

    [Column("marketing_opt_out_at")]
    public DateTime? MarketingOptOutAt { get; set; }

    [Column("currency")]
    public string Currency { get; set; }

    [Column("locale")]
    public string Locale { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Column("subscription_blocked")]
    public bool SubscriptionBlocked { get; set; }

    [Column("is_admin")]
    public bool IsAdmin { get; set; }

    [Column("token_version")]
    public int TokenVersion { get; set; }

    [Column("email_verified")]
    public bool EmailVerified { get; set; }

    [Column("verify_token")]
    public string VerifyToken { get; set; }

    [Column("verify_token_expires")]
    public DateTime? VerifyTokenExpires { get; set; }

    [Column("reset_token")]
    public string ResetToken { get; set; }

    [Column("reset_token_expires")]
    public DateTime? ResetTokenExpires { get; set; }
}

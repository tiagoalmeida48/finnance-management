using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.SettingsSalary.Repository.Models;

[Table("settings_salary")]
public class SettingsSalaryMod : BaseModel
{
    [Key]
    [Column("settings_salary")]
    public long SettingsSalary { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("date_start")]
    public DateTime DateStart { get; set; }

    [Column("date_end")]
    public DateTime DateEnd { get; set; }

    [Column("hourly_rate")]
    public decimal HourlyRate { get; set; }

    [Column("base_salary")]
    public decimal BaseSalary { get; set; }

    [Column("inss_discount_percentage")]
    public decimal InssDiscountPercentage { get; set; }

    [Column("admin_fee_percentage")]
    public decimal AdminFeePercentage { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}

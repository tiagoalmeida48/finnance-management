using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.InstallmentGroup.Repository.Models;

[Table("installment_group")]
public class InstallmentGroupMod : BaseModel
{
    [Key]
    [Column("installment_group")]
    public long InstallmentGroup { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("total_installments")]
    public int TotalInstallments { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}

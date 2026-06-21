namespace Finnance.Api.Modules.InstallmentGroup.Application.Dto;

public class InstallmentGroupDisplayDto
{
    public long InstallmentGroup { get; set; }

    public int TotalInstallments { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}

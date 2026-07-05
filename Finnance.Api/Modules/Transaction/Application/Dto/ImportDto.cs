namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class ImportDto
{
    public List<ImportRowDto> Rows { get; set; }

    public long? PaymentMethod { get; set; }

    public long Account { get; set; }

    public long? Card { get; set; }
}

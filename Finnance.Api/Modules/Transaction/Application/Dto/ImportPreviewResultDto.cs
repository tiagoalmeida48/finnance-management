namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class ImportPreviewResultDto
{
    public List<ImportRowDto> Rows { get; set; }

    public List<string> Errors { get; set; }
}

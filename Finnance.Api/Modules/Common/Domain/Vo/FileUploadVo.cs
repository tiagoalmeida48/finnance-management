namespace Finnance.Api.Modules.Common.Domain.Vo;

public class FileUploadVo(string fileName, string description, Stream file, string type)
{
    public string FileName { get; set; } = fileName;

    public string Description { get; set; } = description;

    public Stream File { get; set; } = file;

    public string Type { get; set; } = type;
}
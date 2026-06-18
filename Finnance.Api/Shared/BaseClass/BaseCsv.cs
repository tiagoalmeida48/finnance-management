namespace Finnance.Api.Shared.BaseClass;

public class BaseCsv
{
    public string Message { get; set; }
    public long LineCsv { get; set; }
    public string MessageFormated => $"{Message} Na linha: {LineCsv}";
}
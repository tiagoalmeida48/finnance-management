namespace Finnance.Api.Modules.Common.Domain.Vo;

public class ReturnAsyncVo<T>
{
    public T DataResult { get; set; }
    public bool Async { get; set; }
    public string Message { get; set; }
    public long Task { get; set; }
}
namespace Finnance.Api.Modules.Common.Domain.Vo;

public class ObjectFieldVo(string objects, string field)
{
    public string Object { get; set; } = objects;
    public string Field { get; set; } =  field;
}
using SpanJson;

namespace Finnance.Api.Shared;

public static class DeepCopyExtensions
{
    public static TTarget DeepCopyJson<TTarget>(this object source)
    {
        if (source == null) return default;

        var jsonBytes = JsonSerializer.Generic.Utf8.Serialize(source);
        return JsonSerializer.Generic.Utf8.Deserialize<TTarget>(jsonBytes);
    }
}
using System.DirectoryServices;
using System.Runtime.Versioning;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    [SupportedOSPlatform("windows")]
    public static string GetPropertyValue(this SearchResult sr, string propertyName)
    {
        var result = string.Empty;

        if (sr.Properties[propertyName].Count > 0)
            result = sr.Properties[propertyName][0].ToString();

        return result;
    }
}
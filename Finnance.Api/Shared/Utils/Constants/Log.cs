namespace Finnance.Api.Shared.Utils;

public static partial class Constants
{
    public class LogConst
    {
        public enum ColumnType { NUMBER = 1, TEXT = 2, DATE_TIME = 3 }

        public readonly static Dictionary<ColumnLog, string> COLUMNS = new()
        {
            { new ColumnLog("LOG", ColumnType.NUMBER), "LOG" },
            { new ColumnLog("LOG_CATEGORY", ColumnType.TEXT), "LOG_CATEGORY" },
            { new ColumnLog("TYPE", ColumnType.TEXT), "TYPE" },
            { new ColumnLog("SOURCE", ColumnType.TEXT), "SOURCE" },
            { new ColumnLog("MESSAGE", ColumnType.TEXT), "MESSAGE" },
            { new ColumnLog("TRACK", ColumnType.TEXT), "TRACK" }
        };

        public readonly static Dictionary<string, string> CONNECTIONS = new()
        {
            { "OU", "OR" },
            { "E", "AND" }
        };

        public readonly static Dictionary<string, string> OPERATORS = new()
        {
            { "IGUAL", "=" },
            { "DIFERENTE", "<>" },
            { "MAIOR", ">" },
            { "MAIOR OU IGUAL", ">=" },
            { "MENOR", "<" },
            { "MENOR OU IGUAL", "<=" },
            { "NÃO CONTÉM", "NOT IN" },
            { "CONTÉM", "IN" },
            { "PARECIDO COM", "LIKE" }
        };

        public readonly static Dictionary<string, string> ORDER_FACTOR = new()
        {
            { "CRESCENTE", "ASC" },
            { "DECRESCENTE", "DESC" }
        };

        public class ColumnLog(string name, ColumnType type)
        {
            public ColumnType Type { get; set; } = type;
            public string Name { get; set; } = name;
        }
    }
}
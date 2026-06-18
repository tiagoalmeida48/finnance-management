using Csv;
using System.Collections.Concurrent;
using System.Text;

namespace Finnance.Api.Shared.Utils;

public class LineCsv<T>(long line, T data)
{
    public long Line { get; set; } = line;
    public T Data { get; set; } = data;
}

public static class CsvHelper
{
    public static IEnumerable<LineCsv<T>> Read<T>(this byte[] csvData, List<string> newHeaders)
    {
        var csvDataEncoding = csvData.GetEncoding();

        var csvDataConverted = csvDataEncoding.GetString(csvData);

        var indexHeader = csvDataConverted.IndexOf('\n');
        csvDataConverted = csvDataConverted.Remove(0, indexHeader);

        var headerCsv = string.Join(';', newHeaders);
        var newHeaderCsv = headerCsv + csvDataConverted;

        var pseudoCSV = CsvReader.ReadFromText(newHeaderCsv).ToList();

        var liRet = new ConcurrentStack<LineCsv<T>>();

        Parallel.ForEach(pseudoCSV, line =>
        {
            var item = ConvertFromCSVToCs<T>(line);
            liRet.Push(new LineCsv<T>(line.Index, item));
        });
        return liRet.OrderBy(r => r.Line);
    }

    public static string ConvertFromCsvBase64(this List<string> columns)
    {
        var bytes = Encoding.UTF8.GetBytes(string.Join(";", columns));
        return $"77u/{Convert.ToBase64String(bytes)}";
    }

    private static T ConvertFromCSVToCs<T>(ICsvLine line)
    {
        var props = typeof(T).GetProperties();
        var entity = Activator.CreateInstance<T>();

        foreach (var info in props)
        {
            try
            {
                var field = line.Headers.SingleOrDefault(h => h.Equals(info.Name, StringComparison.InvariantCultureIgnoreCase));
                if (field == null)
                    continue;

                if (info.PropertyType == typeof(string))
                {
                    info.SetValue(entity, line[field].IsNotEmpty() ? line[field] : null);
                }
                else if (info.PropertyType == typeof(DateTime))
                {
                    if (DateTime.TryParse(line[field], out var magestDate))
                    {
                        if (magestDate.Year > 0001)
                            info.SetValue(entity, magestDate);
                    }
                    else
                    {
                        magestDate = new DateTime(0001, 1, 1);
                        info.SetValue(entity, magestDate);
                    }
                }
                else if (info.PropertyType == typeof(decimal) || info.PropertyType == typeof(decimal?))
                {
                    info.SetValue(entity, line[field].IsNotEmpty() ? line[field].ChangeType(0M) : 0);
                }
                else if (info.PropertyType == typeof(int) || info.PropertyType == typeof(int?))
                {
                    info.SetValue(entity, line[field].IsNotEmpty() ? line[field].ChangeType(0) : null);
                }
                else if (info.PropertyType == typeof(short) || info.PropertyType == typeof(short?) ||
                         info.PropertyType == typeof(byte) || info.PropertyType == typeof(byte?) ||
                         info.PropertyType == typeof(long) || info.PropertyType == typeof(long?) ||
                         info.PropertyType == typeof(double) || info.PropertyType == typeof(double?))
                {
                    info.SetValue(entity, line[field].IsNotEmpty() ? line[field].ChangeType(0) : 0);
                }
                else if (info.PropertyType == typeof(bool) || info.PropertyType == typeof(bool?))
                {
                    var pseudoBool = line[field];
                    pseudoBool = pseudoBool.Replace("1", "true");
                    pseudoBool = pseudoBool.Replace("0", "false");

                    info.SetValue(entity, pseudoBool.ChangeType(false));
                }
                else
                {
                    info.SetValue(entity, line[field]);
                }
            }
            catch (Exception e)
            {
                throw new Exception("Erro ao converter elemento: " + info, e);
            }
        }
        return entity;
    }
}
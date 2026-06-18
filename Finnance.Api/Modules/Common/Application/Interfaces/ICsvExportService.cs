namespace Finnance.Api.Modules.Common.Application.Interfaces;

public interface ICsvExportService
{
    string ColumnsHelperCsv<T>(IEnumerable<T> registers, IEnumerable<string> translatedNameColumns = null, List<string> newColumns = null);
}
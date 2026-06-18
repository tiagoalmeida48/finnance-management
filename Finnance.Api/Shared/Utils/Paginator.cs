namespace Finnance.Api.Shared.Utils;

public class Paginator<T>
{
    public IEnumerable<T> Pages { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalDto { get; set; }
}

public class PaginatorParam
{
    private int _pageSize;
    public int InitialRegistration { get; set; }
    public int PageSize
    {
        get => _pageSize <= 0 ? Constants.MaxPageSizeLimit : Math.Min(Constants.MaxPageSizeLimit, _pageSize);
        set => _pageSize = value;
    }
    public IEnumerable<Ordination> Order { get; set; }
}

public class OrdinationParam
{
    public IEnumerable<Ordination> Order { get; set; }
}

public class Ordination
{
    public string ColumnName { get; set; }
    public bool Ascending { get; set; }
}
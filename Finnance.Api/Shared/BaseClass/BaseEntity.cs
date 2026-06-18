namespace Finnance.Api.Shared.BaseClass;

public abstract class BaseEntity
{
    public string Language { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }

    public virtual void ValidateCreate() { }
    public virtual void ValidateUpdate() { }
    protected virtual void ValidatePersistence() { }
}
using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared.BaseClass;
using System.Transactions;

namespace Finnance.Api.Modules.Common.Application.Services;

public abstract partial class BaseService<T>(IBaseRepository<T> baseRepository) : IBaseService<T> where T : BaseEntity
{
    protected TransactionScope GetTransaction()
    {
        return new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted });
    }
}
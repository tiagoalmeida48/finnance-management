using Finnance.Api.Modules.AccountType.Domain.Entities;
using Finnance.Api.Modules.Common.Application.Interfaces;

namespace Finnance.Api.Modules.AccountType.Application.Interfaces;

public interface IAccountTypeService : IBaseService<AccountTypeEntity>
{
    List<AccountTypeEntity> List();

    AccountTypeEntity Get(long accountType);
}

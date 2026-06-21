using Finnance.Api.Modules.AccountType.Domain.Entities;
using Finnance.Api.Modules.Common.Domain.Interfaces;

namespace Finnance.Api.Modules.AccountType.Domain.Interfaces;

public interface IAccountTypeRepository : IBaseRepository<AccountTypeEntity>
{
    List<AccountTypeEntity> Search(long accountType = 0,
                                   string name = null,
                                   bool active = false,
                                   int quantity = 0);
}

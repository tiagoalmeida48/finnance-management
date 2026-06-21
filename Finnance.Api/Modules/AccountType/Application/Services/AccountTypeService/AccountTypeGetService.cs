using Finnance.Api.Modules.AccountType.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.AccountType.Application.Services;

public partial class AccountTypeService
{
    public List<AccountTypeEntity> List()
    {
        return accountTypeRepository.Search(active: true);
    }

    public AccountTypeEntity Get(long accountType)
    {
        var entity = accountTypeRepository.Search(accountType, active: true, quantity: 1).FirstOrDefault();

        if (entity == null)
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);

        return entity;
    }
}

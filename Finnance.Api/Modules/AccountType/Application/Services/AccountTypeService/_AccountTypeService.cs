using Finnance.Api.Modules.AccountType.Application.Interfaces;
using Finnance.Api.Modules.AccountType.Domain.Entities;
using Finnance.Api.Modules.AccountType.Domain.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;

namespace Finnance.Api.Modules.AccountType.Application.Services;

public partial class AccountTypeService(IAccountTypeRepository accountTypeRepository) : BaseService<AccountTypeEntity>(accountTypeRepository), IAccountTypeService;

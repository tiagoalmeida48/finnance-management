using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.TransactionType.Application.Interfaces;
using Finnance.Api.Modules.TransactionType.Domain.Entities;
using Finnance.Api.Modules.TransactionType.Domain.Interfaces;

namespace Finnance.Api.Modules.TransactionType.Application.Services;

public partial class TransactionTypeService(ITransactionTypeRepository transactionTypeRepository) : BaseService<TransactionTypeEntity>(transactionTypeRepository), ITransactionTypeService;

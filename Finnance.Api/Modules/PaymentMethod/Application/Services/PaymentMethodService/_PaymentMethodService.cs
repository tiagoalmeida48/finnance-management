using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.PaymentMethod.Application.Interfaces;
using Finnance.Api.Modules.PaymentMethod.Domain.Entities;
using Finnance.Api.Modules.PaymentMethod.Domain.Interfaces;

namespace Finnance.Api.Modules.PaymentMethod.Application.Services;

public partial class PaymentMethodService(IPaymentMethodRepository paymentMethodRepository) : BaseService<PaymentMethodEntity>(paymentMethodRepository), IPaymentMethodService;

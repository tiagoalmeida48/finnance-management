using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.CreditCard.Application.Dto;
using Finnance.Api.Modules.CreditCard.Domain.Entities;

namespace Finnance.Api.Modules.CreditCard.Domain.Interfaces;

public interface ICreditCardRepository : IBaseRepository<CreditCardEntity>
{
    List<CreditCardEntity> Search(long user = 0,
                                  long creditCard = 0,
                                  long bankAccount = 0,
                                  bool active = false,
                                  int quantity = 0);

    CreditCardStatsDto GetStats(long creditCard, long user);

    List<CreditCardStatsDto> GetAllStats(long user);
}

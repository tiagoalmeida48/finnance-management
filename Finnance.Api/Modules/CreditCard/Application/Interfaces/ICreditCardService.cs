using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.CreditCard.Application.Dto;
using Finnance.Api.Modules.CreditCard.Domain.Entities;

namespace Finnance.Api.Modules.CreditCard.Application.Interfaces;

public interface ICreditCardService : IBaseService<CreditCardEntity>
{
    CreditCardEntity GetCard(long creditCard, long userId);
    List<CreditCardEntity> List(long userId);
    long CreateCard(CreditCardEntity entity, long userId);
    bool UpdateCard(CreditCardEntity entity, long userId);
    bool DeleteCard(long creditCard, long userId);
    void EnsureOwnership(long creditCard, long userId);
    CreditCardStatsDto GetStats(long creditCard, long userId);
    List<CreditCardStatsDto> GetAllStats(long userId);
}

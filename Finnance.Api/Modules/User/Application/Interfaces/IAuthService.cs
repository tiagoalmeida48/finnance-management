using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IAuthService
{
    SessionVo Login(string email, string password);
    MeDto Me(long user);
}

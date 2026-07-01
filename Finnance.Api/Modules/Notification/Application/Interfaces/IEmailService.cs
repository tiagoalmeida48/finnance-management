namespace Finnance.Api.Modules.Notification.Application.Interfaces;

public interface IEmailService
{
    void SendVerification(string email, string token);

    void SendPasswordReset(string email, string token);
}

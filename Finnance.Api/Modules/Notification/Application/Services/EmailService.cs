using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Finnance.Api.Modules.Notification.Application.Interfaces;

namespace Finnance.Api.Modules.Notification.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    public void SendVerification(string email, string token)
    {
        var link = $"{BaseUrl}/verify-email?token={token}";
        Send(email, "Confirme seu e-mail", $"Bem-vindo ao Finnance. Confirme seu e-mail: {link}");
    }

    public void SendPasswordReset(string email, string token)
    {
        var link = $"{BaseUrl}/reset-password?token={token}";
        Send(email, "Redefinição de senha", $"Para redefinir sua senha, acesse: {link}");
    }

    public void SendPurchaseWelcome(string email, string token)
    {
        var link = $"{BaseUrl}/reset-password?token={token}";
        Send(email, "Seu acesso ao Finnance está liberado", $"Sua compra foi aprovada. Defina sua senha para acessar: {link}");
    }

    private string BaseUrl => configuration["App:BaseUrl"] ?? "http://localhost:5173";

    private void Send(string to, string subject, string body)
    {
        logger.LogInformation("E-mail preparado: {Subject}", subject);
    }
}

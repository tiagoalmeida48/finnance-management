using System.Net;
using System.Net.Mail;
using System.Net.Mime;

namespace Finnance.Api.Shared.Utils;

public class AttachmentEmail
{
    public bool Image { get; set; }
    public string Name { get; set; }
    public byte[] Data { get; set; }
}

public class DataConfigEmail
{
    public string Email { get; set; }
    public string Name { get; set; }
    public int Port { get; set; }
    public string Server { get; set; }
    public string User { get; set; }
    public string Password { get; set; }
    public bool Ssl { get; set; }
}

public abstract class EmailHelper
{
    public static void SendEmailBase(string subject, string msg, string[] recipients, DataConfigEmail config, params AttachmentEmail[] attachments)
    {
        using var mail = new MailMessage();
        foreach (var to in recipients)
            mail.To.Add(to);

        mail.Subject = subject;
        mail.Priority = MailPriority.High;
        mail.IsBodyHtml = true;
        mail.Body = msg;

        if (attachments != null && attachments.Length > 0)
        {
            var images = attachments.Where(w => w.Image);
            foreach (var image in images)
            {
                var htmlView = AlternateView.CreateAlternateViewFromString(msg, null, "text/html");

                if (image.Data.Length > 0)
                {
                    var imageResourceEs = new LinkedResource(new MemoryStream(image.Data));
                    imageResourceEs.ContentType.Name = imageResourceEs.ContentId = "photo";
                    imageResourceEs.ContentType.MediaType = "image/png";
                    imageResourceEs.TransferEncoding = TransferEncoding.Base64;

                    htmlView.LinkedResources.Add(imageResourceEs);
                }

                mail.AlternateViews.Add(htmlView);
            }

            var files = attachments.Where(w => !w.Image);
            foreach (var attachment in files)
            {
                var attach = new Attachment(new MemoryStream(attachment.Data), attachment.Name);
                mail.Attachments.Add(attach);
            }
        }

        SendEmail(mail, config);
    }

    private static void SendEmail(MailMessage message, DataConfigEmail config)
    {
        message.From = new MailAddress(config.Email, config.Name);

        var smtpCli = new SmtpClient(config.Server, config.Port)
        {
            EnableSsl = config.Ssl
        };

        if (config.Password.IsNotEmpty())
        {
            smtpCli.UseDefaultCredentials = false;
            smtpCli.Credentials = new NetworkCredential(config.User, config.Password);
        }

        smtpCli.Send(message);
    }
}
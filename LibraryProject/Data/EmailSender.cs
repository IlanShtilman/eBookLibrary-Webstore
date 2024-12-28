using SendGrid;
using SendGrid.Helpers.Mail;

namespace LibraryProject.Data;

public class EmailSender
{
    public async Task SendEmail(string subject, string username, string message)
    {
        var apiKey = "";
        var client = new SendGridClient(apiKey);
        var from = new EmailAddress("ariel675345@gmail.com", "Library");
        var to = new EmailAddress("ariel675345@gmail.com", username);
        var plainTextContent = message;
        var htmlContent = "";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        var response = await client.SendEmailAsync(msg);
    }
}
using SendGrid;
using SendGrid.Helpers.Mail;

namespace LibraryProject.Data;

public class EmailSender
{
    public async Task SendEmail(string subject, string username, string message)
    {
        var apiKey = "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";
        var client = new SendGridClient(apiKey);
        var from = new EmailAddress("ariel675345@gmail.com", "Library");
        var to = new EmailAddress("ariel675345@gmail.com", username);
        var plainTextContent = message;
        var htmlContent = "";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        var response = await client.SendEmailAsync(msg);
    }
}
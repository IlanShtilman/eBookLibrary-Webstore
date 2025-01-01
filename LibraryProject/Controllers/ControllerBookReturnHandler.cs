using LibraryProject.Data;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace LibraryProject.Controllers;

public class BookReturnHandler : Controller
{
    private readonly MVCProjectContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailSender _emailSender;

    public BookReturnHandler(MVCProjectContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _emailSender = new EmailSender();
    }

    public async Task HandleBookReturn(int bookId)
    {
        var book = await _context.Books.FindAsync(bookId);
        if (book == null) return;

        Console.WriteLine($"Book {bookId} - IsReserved: {book.IsReserved}, ReservedFor: {book.ReservedForUsername}");
        var nextInLine = await _context.WaitingList
            .Where(w => w.BookId == bookId && !w.IsNotified)
            .OrderBy(w => w.Position)
            .FirstOrDefaultAsync();
        if (nextInLine != null)
        {
            // Mark the book as reserved for the next person
            book.IsReserved = true;
            book.ReservedForUsername = nextInLine.Username;
            book.ReservationExpiry = DateTime.Now.AddHours(1);
            book.AvailableCopies = 1; // Ensure there's one copy available for the reserved user
            // Update waiting list entry
            nextInLine.IsNotified = true;
            nextInLine.NotificationDate = DateTime.Now;
            nextInLine.ExpiryDate = DateTime.Now.AddHours(1);
            // Send notification email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == nextInLine.Username);
            if (user != null)
            {
                await SendBookAvailabilityNotification(user.Username, book.Title);
            }

            await _context.SaveChangesAsync();
            // Schedule a task to check reservation expiry
            _ = Task.Run(async () =>
            {
                await Task.Delay(TimeSpan.FromHours(1));
                await HandleReservationExpiry(bookId, nextInLine.Username);
            });
        }
        else
        {
            // No one in waiting list, make book available to everyone
            book.IsReserved = false;
            book.ReservedForUsername = null;
            book.ReservationExpiry = null;
            book.AvailableCopies++;
            await _context.SaveChangesAsync();
        }
    }

    private async Task HandleReservationExpiry(int bookId, string username)
    {
        var book = await _context.Books.FindAsync(bookId);
        if (book == null) return;
        // If book is still reserved for the same user and hasn't been borrowed
        if (book.IsReserved && book.ReservedForUsername == username)
        {
            // Remove current user from waiting list
            var waitingListEntry = await _context.WaitingList
                .FirstOrDefaultAsync(w => w.BookId == bookId && w.Username == username);

            if (waitingListEntry != null)
            {
                _context.WaitingList.Remove(waitingListEntry);
                // Update positions for remaining users
                var remainingEntries = await _context.WaitingList
                    .Where(w => w.BookId == bookId && w.Position > waitingListEntry.Position)
                    .ToListAsync();
                foreach (var entry in remainingEntries)
                {
                    entry.Position--;
                }

                await _context.SaveChangesAsync();
            }

            // Process next person in line
            await HandleBookReturn(bookId);
        }
    }

    private async Task SendBookAvailabilityNotification(string username, string bookTitle)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return;
        var subject = "Book Available for Borrowing";
        var message = $"Dear {user.FirstName},\n\n" +
                      $"The book '{bookTitle}' is now available for you to borrow. " +
                      "You have one hour to borrow this book before it becomes available to the next person in line.\n\n" +
                      "Please log in to your account to complete the borrowing process.\n\n" +
                      "Best regards,\nYour Library Team";
        await _emailSender.SendEmail(subject, username, message);
    }
}
using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class BookController : Controller
{
    private readonly MVCProjectContext _context;

    public BookController(MVCProjectContext context)
    {
        _context = context;
    }
    
    // GET
    public IActionResult Index()
    {
        return View();
    }
    
    public async Task<IActionResult> ViewBook(int id)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == id);
        if (book == null)
        {
            return NotFound();
        }

        // Fetch reviews for the book
        var reviews = await _context.Reviews
            .Where(r => r.BookId == id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // Fetch related user details
        var usernames = reviews.Select(r => r.Username).Distinct();
        var users = await _context.Users
            .Where(u => usernames.Contains(u.Username))
            .ToDictionaryAsync(u => u.Username);

        // Attach user details to reviews
        var reviewDetails = reviews.Select(r => new
        {
            r.Title,
            r.Content,
            r.Rating,
            r.CreatedAt,
            User = users.TryGetValue(r.Username, out var user)
                ? new { user.FirstName, user.LastName }
                : null // Handle the case if a user doesn't exist
        }).ToList();

        ViewBag.Reviews = reviewDetails;

        // Get next and previous book IDs
        var nextBook = await _context.Books
            .Where(b => b.BookId > id)
            .OrderBy(b => b.BookId)
            .FirstOrDefaultAsync();

        var prevBook = await _context.Books
            .Where(b => b.BookId < id)
            .OrderByDescending(b => b.BookId)
            .FirstOrDefaultAsync();

        ViewBag.NextBookId = nextBook?.BookId;
        ViewBag.PrevBookId = prevBook?.BookId;

        return View(book);
    }
    
    [HttpGet]
    public IActionResult AddBook()
    {
        // An action for user login.
        return View(new Book());
    }

    [HttpPost]
    public async Task<IActionResult> AddBook(Book book)
    {
        if (ModelState.IsValid)
        {
            try
            {
                _context.Books.Add(book);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An error occured while registering book.");
                return View(book);
            }
        }
        return View(book);
    }
    
    [HttpGet]
    public async Task<IActionResult> Store(string searchQuery = null, string genre = null)
    {
        var query = _context.Books.AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(searchQuery))
        {
            query = query.Where(b => b.Title.Contains(searchQuery) || 
                                     b.Author.Contains(searchQuery));
        }

        // Apply genre filter
        if (!string.IsNullOrEmpty(genre) && genre.ToLower() != "all")
        {
            if (Enum.TryParse<Genre>(genre, true, out Genre genreEnum))
            {
                query = query.Where(b => b.Genre == genreEnum);
            }
        }

        var books = await query.ToListAsync();
        return View("BookStore", books);
    }
    [HttpGet]
    public async Task<JsonResult> FilterBooks(string searchQuery = null, string genre = null)
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(searchQuery))
        {
            query = query.Where(b => b.Title.Contains(searchQuery) || 
                                     b.Author.Contains(searchQuery));
        }

        if (!string.IsNullOrEmpty(genre) && genre.ToLower() != "all")
        {
            if (Enum.TryParse<Genre>(genre, true, out Genre genreEnum))
            {
                query = query.Where(b => b.Genre == genreEnum);
            }
        }

        var books = await query.ToListAsync();
        return Json(books);
    }
}

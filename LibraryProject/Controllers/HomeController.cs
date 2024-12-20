using System.Diagnostics;
using LibraryProject.Data;
using LibraryProject.Data.Enums;
using Microsoft.AspNetCore.Mvc;
using LibraryProject.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class HomeController : Controller
{
    private readonly MVCProjectContext _context;

    public HomeController(MVCProjectContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        ViewBag.Username = HttpContext.Session.GetString("Username");
        string username = HttpContext.Session.GetString("Username");
        ViewBag.Role = 0;
        if (username != null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user.Role == UserRole.Admin)
            {
                ViewBag.Role = 1;
            }
        }
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
using LibraryProject.Data;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;


public class WaitingListController : Controller
{
    private readonly MVCProjectContext _context;

    public WaitingListController(MVCProjectContext context)
    {
        _context = context;
    }
}
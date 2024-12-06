using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Models;
[Keyless]
[NotMapped]
public class UserBook
{
    public int UserName { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; }
    public User User { get; set; }
}
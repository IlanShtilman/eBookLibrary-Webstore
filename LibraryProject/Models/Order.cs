using System.ComponentModel.DataAnnotations;

namespace LibraryProject.Models;

public class Order
{
    [Key]
    public int OrderId { get; set; }
    [Required]
    public string Username { get; set; }
    public int BookId { get; set; }
    public string Action  { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime OrderDate { get; set; }
}
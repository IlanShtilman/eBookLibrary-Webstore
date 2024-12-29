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
    public DateTime? BorrowStartDate { get; set; }
    public DateTime? BorrowEndDate { get; set; }
    public bool? IsReturned { get; set; }
    public int? IsRemoved { get; set; }
}
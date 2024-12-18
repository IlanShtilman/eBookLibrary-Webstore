namespace LibraryProject.Models;

public class ShoppingCart
{
    public string Username { get; set; }
    public int BookId { get; set; }
    public string Action { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LibraryProject.Data.Enums;

namespace LibraryProject.Models;

public class Book
{
    [Key]
    public int BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string Publisher { get; set; }
    public int PublishYear { get; set; }
    public Genre Genre { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    
    public bool IsAvailableToBuy { get; set; }
    public bool IsAvailableToBorrow { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public double BorrowPrice { get; set; }
    public double BuyPrice { get; set; }
    public double? DiscountedBuyPrice { get; set; }
    public DateTime? DiscountStartDate { get; set; } 
    public DateTime? DiscountEndDate { get; set; }
    
    public bool IsEpubAvailable { get; set; }
    public bool IsF2bAvailable { get; set; }
    public bool IsMobiAvailable { get; set; }
    public bool IsPdfAvailable { get; set; }
    
    public string? ImageUrl { get; set; }
    
    public bool IsReserved { get; set; }
    
    public string? ReservedForUsername { get; set; }
    public DateTime? ReservationExpiry { get; set; }
    
    // These are computed properties - we don't store them in the database
    [NotMapped]
    public bool IsOnDiscount => 
        DiscountedBuyPrice.HasValue && 
        DiscountStartDate.HasValue && 
        DiscountEndDate.HasValue &&
        DateTime.Now >= DiscountStartDate.Value && 
        DateTime.Now <= DiscountEndDate.Value;

    [NotMapped]
    public double CurrentBuyPrice => IsOnDiscount ? DiscountedBuyPrice.Value : BuyPrice;
}
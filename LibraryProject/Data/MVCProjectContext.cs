using Microsoft.EntityFrameworkCore;
using LibraryProject.Models;

namespace LibraryProject.Data
{
    public class MVCProjectContext : DbContext
    {
        public MVCProjectContext(DbContextOptions<MVCProjectContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Wishlist> Wishlist { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("SHTILMAN");
            
            modelBuilder.HasSequence<int>("REVIEWS_SEQ", schema: "SHTILMAN").StartsAt(0).IncrementsBy(1);
            
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS","SHTILMAN");
                entity.HasKey(e => e.Username);
                entity.Property(e => e.Username).HasColumnName("USERNAME");
                entity.Property(e => e.Password).HasColumnName("PASSWORD");
                entity.Property(e => e.Email).HasColumnName("EMAIL");
                entity.Property(e => e.FirstName).HasColumnName("FIRSTNAME");  // Note: FirstName maps to FIRSTNAME
                entity.Property(e => e.LastName).HasColumnName("LASTNAME");
    
                // For the enum properties, we need to tell EF Core to convert them to strings
                entity.Property(e => e.Gender)
                    .HasColumnName("GENDER")
                    .HasConversion<string>();
        
                entity.Property(e => e.Role)
                    .HasColumnName("ROLE")
                    .HasConversion<string>();
                
            });
            
            modelBuilder.Entity<Book>(entity =>
            {
                entity.ToTable("BOOKS","SHTILMAN");
                entity.HasKey(e => e.BookId);
                entity.Property(e => e.BookId).HasColumnName("BOOKID");
                entity.Property(e => e.Title).HasColumnName("TITLE");
                entity.Property(e => e.Author).HasColumnName("AUTHOR");
                entity.Property(e => e.Genre).HasColumnName("GENRE").HasConversion<string>();
                entity.Property(e => e.AgeRestriction).HasColumnName("AGERESTRICTION").HasConversion<string>();
                entity.Property(e => e.Publisher).HasColumnName("PUBLISHER");
                entity.Property(e => e.PublishYear).HasColumnName("PUBLISHYEAR");
                entity.Property(e => e.BuyPrice).HasColumnName("BUYPRICE");
                entity.Property(e => e.BorrowPrice).HasColumnName("BORROWPRICE");
                entity.Property(e => e.TotalCopies).HasColumnName("TOTALCOPIES");
                entity.Property(e => e.AvailableCopies).HasColumnName("AVAILABLECOPIES");
                entity.Property(e => e.IsAvailableToBuy).HasColumnName("ISAVAILABLETOBUY");
                entity.Property(e => e.IsAvailableToBorrow).HasColumnName("ISAVAILABLETOBORROW");
                // Fix these to match your database column names
                entity.Property(e => e.IsEpubAvailable).HasColumnName("ISEPUB");
                entity.Property(e => e.IsF2bAvailable).HasColumnName("ISF2B");
                entity.Property(e => e.IsMobiAvailable).HasColumnName("ISMOBI");
                entity.Property(e => e.IsPdfAvailable).HasColumnName("ISPDF");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("REVIEWS", "SHTILMAN");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("REVIEWID");
                entity.Property(e => e.Username).HasColumnName("USERNAME");
                entity.Property(e => e.BookId).HasColumnName("BOOKID");
                entity.Property(e => e.Title).HasColumnName("TITLE");
                entity.Property(e => e.Content).HasColumnName("CONTENT");
                entity.Property(e => e.Rating).HasColumnName("RATING");
                entity.Property(e => e.CreatedAt).HasColumnName("REVIEWDATE");
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("ORDERS", "SHTILMAN");
                entity.HasKey(e => new { e.OrderId, e.Username, e.BookId });
                entity.Property(e => e.OrderId).HasColumnName("ORDERID");
                entity.Property(e => e.Username).HasColumnName("USERNAME");
                entity.Property(e => e.BookId).HasColumnName("BOOKID");
                entity.Property(e => e.Action).HasColumnName("ACTION");
                entity.Property(e => e.Price).HasColumnName("PRICE");
                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");
                entity.Property(e => e.OrderDate).HasColumnName("ORDERDATE");
            });
            
            modelBuilder.Entity<Wishlist>(entity =>
            {
                entity.ToTable("WISHLIST", "SHTILMAN");
                entity.HasKey(e => new { e.Username, e.BookId });
                entity.Property(e => e.Username).HasColumnName("USERNAME");
                entity.Property(e => e.BookId).HasColumnName("BOOKID");
                //Foreign key
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(e => e.Username)
                    .HasConstraintName("FK_WISHLIST_USERS");

                entity.HasOne<Book>()
                    .WithMany()
                    .HasForeignKey(e => e.BookId)
                    .HasConstraintName("FK_WISHLIST_BOOKS");
            });
        }
    }
}
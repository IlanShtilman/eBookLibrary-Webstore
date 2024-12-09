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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("SHTILMAN");  

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
            
        }
    }
}
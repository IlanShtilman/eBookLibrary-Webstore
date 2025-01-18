# eBook Library Service

A comprehensive digital library platform that allows users to buy, borrow, and manage electronic books. Inspired by platforms like Audible and Libby, this service provides a seamless experience for digital book consumption.

## Technologies Used
- ASP.NET MVC (Framework)
- Oracle Database
- HTML5
- CSS3
- JavaScript
- Bootstrap (Frontend Framework)

## Key Features

### For Users
- Search and browse through an extensive eBook catalog
- Buy or borrow books with flexible options
- Personal library management
- Waiting list system for popular borrowed books
- Book ratings and reviews
- Custom Wishlist functionality
- Secure payment processing
- Email notifications for various events

### For Administrators
- Complete book catalog management
- User management system
- Dynamic pricing control with time-limited discounts
- Waiting list management
- Borrowing time frame control
- Book availability management

### Additional Custom Features
- Wishlist functionality for users to save books for later
- Contact Us system for user support
- Enhanced search with partial query matching
- Multiple book format support (epub, f2b, mobi, PDF)

## Technical Details
- Built with ASP.NET MVC architecture pattern
- Oracle Database for robust data management
- Responsive design using Bootstrap
- Interactive features implemented with JavaScript
- Custom styling with CSS
- Secure payment processing with SSL
- Email notification system
- Real-time availability updates

## Security Features
- Secure credit card processing (no storage of card details)
- SSL certificate implementation
- User authentication and authorization
- Protected admin dashboard

## Setup and Installation

### Prerequisites
1. Visual Studio (2019 or later recommended)
2. Oracle Database (XE or higher)
3. .NET Framework
4. Oracle Data Access Components (ODAC)

### Database Setup
1. Execute the provided SQL scripts in Oracle SQL Developer or your preferred Oracle client:
   - `01_CreateTables.sql` - Creates the database structure
   - `02_InsertInitialData.sql` - Populates initial book data
2. Update the connection string in `Web.config` with your Oracle credentials:
   ```xml
   <connectionStrings>
     <add name="OracleDbContext" 
          connectionString="DATA SOURCE=localhost:1521/XE;USER ID=your_username;PASSWORD=your_password"
          providerName="Oracle.ManagedDataAccess.Client" />
   </connectionStrings>
Application Setup
Clone the repository
Open the solution file (eBookLibrary.sln) in Visual Studio
Restore NuGet packages
Build the solution
Run the application (F5 or Ctrl+F5)

Common Issues and Solutions
If you encounter Oracle connection issues, verify ODAC is properly installed
Make sure Oracle services are running before starting the application
Check firewall settings if database connection fails

Copy

Would you like me to add any other specific setup instructions or modify any part of this? For example, we could add more details about specific configuration files or environment settings that are important for your implementation.
 Copy
Retry



Claude can make mistakes. Please double-check responses.

## Project Context
This project was developed as part of the Introduction to Computer Communications course. It demonstrates the implementation of a full-stack web application with focus on security, user experience, and scalable architecture.

## Authors
- Ilan Shtilman
- Ariel Perstin

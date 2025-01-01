document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.delete-book').forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-bookid');
            if (bookId) {
                deleteBook(bookId);
            }
        });
    });
});

function deleteBook(bookId) {
    console.log('Sending bookId:', bookId); // Debug log
    if (confirm('Are you sure you want to remove this book from your library?')) {
        fetch('/User/DeleteUserBook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "bookId": bookId }) 
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert(data.message || 'Error removing book');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error removing book');
            });
    }
}

function downloadFormat(bookId, title, format) {
    // Using window.location.href for direct download
    window.location.href = `/User/DownloadBook?bookId=${bookId}&title=${encodeURIComponent(title)}&format=${format}`;
}
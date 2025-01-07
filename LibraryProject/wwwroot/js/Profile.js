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

/*Notification Message showing time and style*/
document.addEventListener('DOMContentLoaded', function() {
    var alert = document.getElementById('expiration-alert');
    if (alert) {
        setTimeout(function() {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 1s ease';
            setTimeout(function() {
                alert.style.display = 'none';
            }, 1000);
        }, 4000);  // Will start fading after 4 seconds
    }
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('Adding delete button handlers');
    document.querySelectorAll('.delete-book').forEach(button => {
        console.log('Found delete button with bookId:', button.getAttribute('data-bookid'));
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-bookid');
            console.log('Delete button clicked for bookId:', bookId);
            if (bookId) {
                deleteBook(bookId);
            }
        });
    });
});

function deleteBook(bookId) {
    console.log('Starting delete process for bookId:', bookId);
    if (confirm('Are you sure you want to remove this book from your library?')) {
        console.log('Delete confirmed for bookId:', bookId);
        fetch('/User/DeleteUserBook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId: parseInt(bookId) })
        })
            .then(response => {
                console.log('Server response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    const bookCard = document.querySelector(`.book-card[data-bookid="${bookId}"]`);
                    if (bookCard) {
                        bookCard.style.opacity = '0';
                        setTimeout(() => {
                            bookCard.remove();
                        }, 300);
                    }
                } else {
                    alert(data.message || 'Error removing book');
                }
            })
            .catch(error => {
                console.error('Error in delete process:', error);
                alert('Error removing book');
            });
    }
}
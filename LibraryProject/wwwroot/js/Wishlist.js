async function removeFromWishlist(bookId) {
    try {
        const response = await fetch(`/Wishlist/RemoveFromWishlist?bookId=${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Find the wishlist card
                const card = document.querySelector(`[data-book-id="${bookId}"]`);
                if (card) {
                    // Add fade-out animation
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateX(-20px)';

                    // Wait for animation to complete before removing
                    setTimeout(() => {
                        card.remove();

                        // Update item count
                        const itemsCount = document.querySelector('.items-count');
                        const currentCount = parseInt(itemsCount.textContent);
                        itemsCount.textContent = `${currentCount - 1} items`;

                        // If no items left, show empty state
                        if (currentCount - 1 === 0) {
                            const wishlistGrid = document.querySelector('.wishlist-grid');
                            const emptyState = `
                                <div class="empty-wishlist">
                                    <i class="fa-solid fa-heart-crack"></i>
                                    <p>Your wishlist is empty</p>
                                    <a href="/Book/Store" class="browse-books-btn">Browse Books</a>
                                </div>`;
                            wishlistGrid.innerHTML = emptyState;
                        }
                    }, 300);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addToCart(bookId, action) {
    try {
        const response = await fetch('/ShoppingCart/AddToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookId,
                quantity: 1,
                action: action
            })
        });

        if (response.ok) {
            await removeFromWishlist(bookId);
            window.location.href = '/ShoppingCart';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
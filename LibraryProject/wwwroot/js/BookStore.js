
// Filter Section
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.sf-search__input');
    const searchButton = document.querySelector('.sf-search__button');
    const filterButtons = document.querySelectorAll('.sf-filter__btn');
    const sortSelect = document.getElementById('sortSelect');
    const ageRestrictionSelect = document.getElementById('ageRestrictionSelect');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const publishYearInput = document.getElementById('publishYear');

    let currentFilters = {
        genre: 'all',
        searchQuery: '',
        sortBy: '',
        minPrice: null,
        maxPrice: null,
        publishYear: null,
        ageRestriction: null
    };

    async function filterBooks() {
        try {
            const queryParams = new URLSearchParams({
                genre: currentFilters.genre,
                searchQuery: currentFilters.searchQuery,
                sortBy: currentFilters.sortBy,
                minPrice: currentFilters.minPrice || '',
                maxPrice: currentFilters.maxPrice || '',
                publishYear: currentFilters.publishYear || '',
                ageRestriction: currentFilters.ageRestriction || ''
            });
            const response = await fetch(`/Book/FilterBooks?${queryParams}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const books = await response.json();
            updateBookDisplay(books);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateFilterButtons(selectedGenre) {
        filterButtons.forEach(btn => {
            btn.classList.toggle('sf-filter__btn--active',
                btn.dataset.genre === selectedGenre);
        });
    }

    function updateBookDisplay(books) {
        const productsContainer = document.querySelector('.sf-products');
        const bookCount = document.querySelector('.book-count');

        // Get current wishlist items from the page
        const currentWishlistItems = Array.from(document.querySelectorAll('.sf-product-card__wishlist'))
            .filter(item => item.querySelector('.fa-heart.fas'))
            .map(item => parseInt(item.dataset.bookId));

        productsContainer.innerHTML = '';
        bookCount.textContent = `Showing ${books.length} books`;

        if (books.length === 0) {
            productsContainer.innerHTML = '<div class="no-results">No books found</div>';
            return;
        }

        books.forEach(book => {
            const isInWishlist = currentWishlistItems.includes(book.bookId);
            const heartClass = isInWishlist ? "fas active" : "far";

            const bookCard = `
            <div class="sf-product-card ${book.genre}" data-year="${book.publishYear}" data-age="${book.ageRestriction}">
                <div class="sf-product-card__image-wrapper">
                    <img class="sf-product-card__image" src="/images/book-placeholder.jpg" alt="${book.title}" />
                    <div class="sf-product-card__wishlist" data-book-id="${book.bookId}">
                        <i class="fa-heart ${heartClass}"></i>
                    </div>
                    <div class="sf-product-card__quantity">
                        ${book.availableCopies} borrow copies left
                    </div>
                </div>
                    <div class="sf-product-card__content">
                        <h5 class="sf-product-card__title">${book.title}</h5>
                        <p class="sf-product-card__author">by ${book.author}</p>
                        <p class="sf-product-card__year">Published: ${book.publishYear}</p>
                        <p class="sf-product-card__age">Age: ${book.ageRestriction}</p>
                        <div class="sf-product-card__formats">
                            ${book.isEpubAvailable ? '<span class="format-badge">EPUB</span>' : ''}
                            ${book.isPdfAvailable ? '<span class="format-badge">PDF</span>' : ''}
                            ${book.isMobiAvailable ? '<span class="format-badge">MOBI</span>' : ''}
                            ${book.isF2bAvailable ? '<span class="format-badge">F2B</span>' : ''}
                        </div>
                        <div class="sf-product-card__prices">
                            <p class="price">Buy: $${book.buyPrice}</p>
                            <p class="price">Borrow: $${book.borrowPrice}</p>
                        </div>
                        <div class="sf-product-card__actions">
                            ${book.isAvailableToBuy ?
                `<button class="buy-btn ${book.availableCopies <= 0 ? 'disabled' : ''}" 
                                    data-book-id="${book.bookId}" 
                                    ${book.availableCopies <= 0 ? 'disabled' : ''}>
                                    Buy
                                </button>` : ''}
                            ${book.isAvailableToBorrow && book.availableCopies > 0 ?
                `<button class="borrow-btn ${book.availableCopies <= 0 ? 'disabled' : ''}" 
                                    data-book-id="${book.bookId}" 
                                    ${book.availableCopies <= 0 ? 'disabled' : ''}>
                                    Borrow
                                </button>` : ''}
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += bookCard;
        });
        setupActionButtonListeners();
    }
    // Event Listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilters.genre = button.dataset.genre;
            updateFilterButtons(currentFilters.genre);
            filterBooks();
        });
    });

    searchButton.addEventListener('click', () => {
        currentFilters.searchQuery = searchInput.value;
        filterBooks();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.searchQuery = searchInput.value;
            filterBooks();
        }
    });

    sortSelect.addEventListener('change', () => {
        currentFilters.sortBy = sortSelect.value;
        filterBooks();
    });

    ageRestrictionSelect.addEventListener('change', () => {
        currentFilters.ageRestriction = ageRestrictionSelect.value;
        filterBooks();
    });

    minPriceInput.addEventListener('change', () => {
        currentFilters.minPrice = minPriceInput.value;
        filterBooks();
    });

    maxPriceInput.addEventListener('change', () => {
        currentFilters.maxPrice = maxPriceInput.value;
        filterBooks();
    });

    publishYearInput.addEventListener('change', () => {
        currentFilters.publishYear = publishYearInput.value;
        filterBooks();
    });

    // Initial load
    filterBooks();

    
    //WishList add/remove
    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const bookId = e.currentTarget.dataset.bookId;
            const heartIcon = e.currentTarget.querySelector('.fa-heart');

            try {
                if (heartIcon.classList.contains('far')) {
                    // Book is not in wishlist, so add it
                    await addToWishlist(bookId);
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'active');
                } else {
                    // Book is in wishlist, so remove it
                    await removeFromWishlist(bookId);
                    heartIcon.classList.remove('fas', 'active');
                    heartIcon.classList.add('far');
                }
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Handle error, e.g., display a message to the user
            }
        });
    });

    async function addToWishlist(bookId) {
        const response = await fetch('/Book/AddToWishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
    }

    async function removeFromWishlist(bookId) {
        const response = await fetch('/Book/RemoveFromWishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
    }

    function setupActionButtonListeners() {
        // Add wishlist click handlers
        document.querySelectorAll('.sf-product-card__wishlist').forEach(wishlistElement => {
            wishlistElement.addEventListener('click', async function(event) {
                const bookId = parseInt(this.dataset.bookId);
                console.log('Raw bookId from dataset:', bookId);
                console.log('Type of bookId:', typeof bookId);

                // Parse bookId to number since it comes as string from dataset
                const parsedBookId = parseInt(bookId, 10);
                console.log('Parsed bookId:', parsedBookId);

                const heartIcon = this.querySelector('.fa-heart');
                const isInWishlist = heartIcon.classList.contains('fas');
                console.log('Is in wishlist:', isInWishlist);

                try {
                    if (isInWishlist) {
                        const response = await fetch('/Book/RemoveFromWishlist', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(bookId)
                        });

                        if (response.ok) {
                            heartIcon.classList.remove('fas', 'active');
                            heartIcon.classList.add('far');
                            console.log('Successfully removed from wishlist');
                        } else if (response.status === 401) {
                            window.location.href = '/User/Login';
                        }
                    } else {
                        const response = await fetch('/Book/AddToWishlist', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(bookId)
                        });

                        if (response.ok) {
                            heartIcon.classList.remove('far');
                            heartIcon.classList.add('fas', 'active');
                            console.log('Successfully added to wishlist');
                        } else if (response.status === 401) {
                            window.location.href = '/User/Login';
                        }
                    }
                } catch (error) {
                    console.error('Error updating wishlist:', error);
                }
            });
        });

        // Buy button listeners
        document.querySelectorAll('.buy-btn:not(.disabled)').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = this.dataset.bookId;
                try {
                    const response = await fetch('/Book/BuyBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookId)
                    });

                    if (response.ok) {
                        filterBooks(); // Refresh the display
                    } else if (response.status === 401) {
                        window.location.href = '/User/Login';
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });

        // Borrow button listeners
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = this.getAttribute('data-book-id');

                try {
                    const response = await fetch('/Book/BorrowBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookId)
                    });

                    const result = await response.json();

                    if (!result.success) {
                        // Create or update error message div
                        let errorDiv = document.querySelector('.error-message');
                        if (!errorDiv) {
                            errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            this.closest('.sf-product-card__actions').insertAdjacentElement('afterend', errorDiv);
                        }
                        errorDiv.textContent = result.message;

                        // Keep the error message visible until user clicks somewhere else
                        const hideError = (e) => {
                            if (!errorDiv.contains(e.target) && !this.contains(e.target)) {
                                errorDiv.remove();
                                document.removeEventListener('click', hideError);
                            }
                        };

                        // Add click listener after a small delay to prevent immediate dismissal
                        setTimeout(() => {
                            document.addEventListener('click', hideError);
                        }, 100);
                        setTimeout(() => {
                            if (errorDiv && errorDiv.parentNode) {
                                errorDiv.remove();
                                document.removeEventListener('click', hideError);
                            }
                        }, 3000);
                    } else {
                        // Remove error message if exists and success
                        const errorDiv = document.querySelector('.error-message');
                        if (errorDiv) {
                            errorDiv.remove();
                        }
                        // Refresh the page on success
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });

        // Prevent clicks on disabled buttons
        document.querySelectorAll('.buy-btn.disabled, .borrow-btn.disabled').forEach(button => {
            button.addEventListener('click', (e) => e.preventDefault());
        });
    }

    
});
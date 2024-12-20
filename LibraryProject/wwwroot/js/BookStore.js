
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
                `<button class="buy-btn" 
                                    data-book-id="${book.bookId}" 
                                    >
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
                    console.log('Sending buy request for book ID:', bookId);
                    const response = await fetch('/Book/BuyBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookId)
                    });

                    console.log('Response status:', response.status);
                    if (response.status === 401) {
                        window.location.href = '/User/Login';
                        return;
                    }

                    const result = await response.json();
                    console.log('Server response:', result);

                    // Force show the message regardless of parent element
                    const messageDiv = document.createElement('div');
                    messageDiv.className = result.success ? 'success-message' : 'error-message';
                    messageDiv.textContent = result.message;
                    messageDiv.style.position = 'fixed';
                    messageDiv.style.top = '20px';
                    messageDiv.style.left = '50%';
                    messageDiv.style.transform = 'translateX(-50%)';
                    messageDiv.style.zIndex = '9999';

                    document.body.appendChild(messageDiv);

                    // Remove after 3 seconds
                    setTimeout(() => {
                        if (messageDiv && messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 3000);

                    if (result.success) {
                        // Optional: Update UI or refresh data
                        filterBooks();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(this, 'You must logged in to buy a book.', false);
                }
            });
        });

// Borrow button listeners with similar updates
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = this.getAttribute('data-book-id');
                try {
                    console.log('Sending borrow request for book ID:', bookId);
                    const response = await fetch('/Book/BorrowBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookId)
                    });

                    console.log('Response status:', response.status);
                    if (response.status === 401) {
                        window.location.href = '/User/Login';
                        return;
                    }

                    const result = await response.json();
                    console.log('Server response:', result);

                    // Force show the message regardless of parent element
                    const messageDiv = document.createElement('div');
                    messageDiv.className = result.success ? 'success-message' : 'error-message';
                    messageDiv.textContent = result.message;
                    messageDiv.style.position = 'fixed';
                    messageDiv.style.top = '20px';
                    messageDiv.style.left = '50%';
                    messageDiv.style.transform = 'translateX(-50%)';
                    messageDiv.style.zIndex = '9999';

                    document.body.appendChild(messageDiv);

                    // Remove after 3 seconds
                    setTimeout(() => {
                        if (messageDiv && messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 3000);

                    if (result.success) {
                        // Optional: Update UI or refresh data
                        filterBooks();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(this, 'You must logged in to borrow a book.', false);
                }
            });
        });
        function showMessage(element, message, isSuccess) {
            // Remove any existing messages first
            const existingMessages = document.querySelectorAll('.success-message, .error-message');
            existingMessages.forEach(msg => msg.remove());

            // Create the message element
            const messageDiv = document.createElement('div');
            messageDiv.className = isSuccess ? 'success-message' : 'error-message';
            messageDiv.textContent = message;

            // Find the closest parent card and append the message
            const parentCard = element.closest('.sf-product-card__content');
            if (parentCard) {
                const actionsDiv = parentCard.querySelector('.sf-product-card__actions');
                if (actionsDiv) {
                    actionsDiv.insertAdjacentElement('afterend', messageDiv);
                }
            }

            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (messageDiv && messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 3000);

            // Remove on click outside
            const handleClickOutside = (e) => {
                if (!messageDiv.contains(e.target) && !element.contains(e.target)) {
                    messageDiv.remove();
                    document.removeEventListener('click', handleClickOutside);
                }
            };

            // Add click listener after a small delay
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }
        
        
        // Prevent clicks on disabled buttons
        document.querySelectorAll('.buy-btn.disabled, .borrow-btn.disabled').forEach(button => {
            button.addEventListener('click', (e) => e.preventDefault());
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var viewBookNavBtn = document.getElementById('viewBookNavBtn');
        var addBookNavBtn = document.getElementById('viewBookNavBtn');
        if (viewBookNavBtn) {
            viewBookNavBtn.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent the default link behavior
                window.location.href = '/Book/ViewBook'; // Redirect to the desired URL
            });
        }
        if (addBookNavBtn) {
            viewBookNavBtn.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent the default link behavior
                window.location.href = '/Book/AddBook'; // Redirect to the desired URL
            });
        }
    });
    
    
});
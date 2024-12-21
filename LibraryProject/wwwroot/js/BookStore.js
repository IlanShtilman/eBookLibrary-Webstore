// Main initialization - this should be at the root level
document.addEventListener('DOMContentLoaded', function() {
    // Element selections
    const searchInput = document.querySelector('.sf-search__input');
    const searchButton = document.querySelector('.sf-search__button');
    const filterButtons = document.querySelectorAll('.sf-filter__btn');
    const sortSelect = document.getElementById('sortSelect');
    const ageRestrictionSelect = document.getElementById('ageRestrictionSelect');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const publishYearInput = document.getElementById('publishYear');

    // Filter state
    let currentFilters = {
        genre: 'all',
        searchQuery: '',
        sortBy: '',
        minPrice: null,
        maxPrice: null,
        publishYear: null,
        ageRestriction: null,
        onlyDiscounted: false
    };

    // Core filtering function
    async function filterBooks() {
        try {
            const queryParams = new URLSearchParams({
                genre: currentFilters.genre,
                searchQuery: currentFilters.searchQuery,
                sortBy: currentFilters.sortBy,
                minPrice: currentFilters.minPrice || '',
                maxPrice: currentFilters.maxPrice || '',
                publishYear: currentFilters.publishYear || '',
                ageRestriction: currentFilters.ageRestriction || '',
                onlyDiscounted: currentFilters.onlyDiscounted
            });
            console.log('Query params:', queryParams.toString());
            const response = await fetch(`/Book/FilterBooks?${queryParams}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const books = await response.json();
            console.log('Received books:', books);
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
        const currentWishlistItems = Array.from(document.querySelectorAll('.sf-product-card__wishlist'))
            .filter(item => item.querySelector('.fa-heart.fas'))
            .map(item => parseInt(item.dataset.bookId));

        productsContainer.innerHTML = '';
        bookCount.textContent = `Showing ${books.length} books`;

        books.forEach(book => {
            const isInWishlist = currentWishlistItems.includes(book.bookId);
            const heartClass = isInWishlist ? "fas active" : "far";

            const priceDisplay = book.isOnDiscount
                ? `<p class="price">Buy: 
                     <span class="original-price text-decoration-line-through">$${book.buyPrice.toFixed(2)}</span>
                     <span class="discounted-price">$${book.discountedBuyPrice.toFixed(2)}</span>
                     <small class="discount-timer">Sale ends: ${new Date(book.discountEndDate).toLocaleDateString()}</small>
                   </p>`
                : `<p class="price">Buy: $${book.buyPrice.toFixed(2)}</p>`;

            const bookCard = `
            <div class="sf-product-card ${book.genre}" data-year="${book.publishYear}" data-age="${book.ageRestriction}">
                <div class="sf-product-card__image-wrapper">
                    <img class="sf-product-card__image" 
                         src="${book.imageUrl ? `/images/BookCovers/${book.imageUrl}` : '/images/book-placeholder.jpg'}"
                         alt="${book.title}"
                         onerror="this.onerror=null; this.src='/images/book-placeholder.jpg';"
                    />
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
                        ${priceDisplay}
                        <p class="price">Borrow: $${book.borrowPrice.toFixed(2)}</p>
                    </div>
                    <div class="sf-product-card__actions">
                        ${book.isAvailableToBuy
                ? `<button class="buy-btn" 
             data-book-id="${book.bookId}">
             Buy
           </button>`
                : ''}
                        ${book.isAvailableToBorrow && book.availableCopies > 0
                ? `<button class="borrow-btn ${book.availableCopies <= 0 ? 'disabled' : ''}" 
                                       data-book-id="${book.bookId}" 
                                       ${book.availableCopies <= 0 ? 'disabled' : ''}>
                                 Borrow
                               </button>`
                : ''}
                    </div>
                </div>
            </div>`;
            productsContainer.innerHTML += bookCard;
        });

        setupActionButtonListeners();
    }

    // All event listeners
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
        currentFilters.onlyDiscounted = (sortSelect.value === 'on_sale');
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

    function handleAuthRequired(element) {
        if (confirm('Please log in to continue. Would you like to go to the login page?')) {
            window.location.href = '/User/Login';
        }
    }

    function showMessage(element, message, isSuccess) {
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = isSuccess ? 'success-message' : 'error-message';
        messageDiv.textContent = message;

        const parentCard = element.closest('.sf-product-card__content');
        if (parentCard) {
            const actionsDiv = parentCard.querySelector('.sf-product-card__actions');
            if (actionsDiv) {
                actionsDiv.insertAdjacentElement('afterend', messageDiv);
            }
        }

        setTimeout(() => {
            if (messageDiv && messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);

        const handleClickOutside = (e) => {
            if (!messageDiv.contains(e.target) && !element.contains(e.target)) {
                messageDiv.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
    }

    function setupActionButtonListeners() {
        // Wishlist handlers
        document.querySelectorAll('.sf-product-card__wishlist').forEach(wishlistElement => {
            wishlistElement.addEventListener('click', async function(event) {
                const bookId = parseInt(this.dataset.bookId);
                const heartIcon = this.querySelector('.fa-heart');
                const isInWishlist = heartIcon.classList.contains('fas');

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
                        } else if (response.status === 401) {
                            window.location.href = '/User/Login';
                        }
                    }
                } catch (error) {
                    console.error('Error updating wishlist:', error);
                }
            });
        });

        // Buy button handlers
        document.querySelectorAll('.buy-btn:not(.disabled)').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = this.dataset.bookId;
                try {
                    console.log('Sending buy request for book ID:', bookId);
                    const response = await fetch('/Book/BuyBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bookId)
                    });

                    if (response.status === 401) {
                        handleAuthRequired(this);
                        return;
                    }

                    const result = await response.json();
                    console.log('Server response:', result);

                    const messageDiv = document.createElement('div');
                    messageDiv.className = result.success ? 'success-message' : 'error-message';
                    messageDiv.textContent = result.message;
                    messageDiv.style.position = 'fixed';
                    messageDiv.style.top = '20px';
                    messageDiv.style.left = '50%';
                    messageDiv.style.transform = 'translateX(-50%)';
                    messageDiv.style.zIndex = '9999';

                    document.body.appendChild(messageDiv);

                    setTimeout(() => {
                        if (messageDiv && messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 3000);

                    if (result.success) {
                        filterBooks();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(this, 'You must be logged in to buy a book.', false);
                }
            });
        });

        // Borrow button handlers
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = this.getAttribute('data-book-id');
                try {
                    console.log('Sending borrow request for book ID:', bookId);
                    const response = await fetch('/Book/BorrowBook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bookId)
                    });

                    if (response.status === 401) {
                        handleAuthRequired(this);
                        return;
                    }

                    const result = await response.json();

                    const messageDiv = document.createElement('div');
                    messageDiv.className = result.success ? 'success-message' : 'error-message';
                    messageDiv.textContent = result.message;
                    messageDiv.style.position = 'fixed';
                    messageDiv.style.top = '20px';
                    messageDiv.style.left = '50%';
                    messageDiv.style.transform = 'translateX(-50%)';
                    messageDiv.style.zIndex = '9999';

                    document.body.appendChild(messageDiv);

                    setTimeout(() => {
                        if (messageDiv && messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 3000);

                    if (result.success) {
                        filterBooks();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(this, 'You must be logged in to borrow a book.', false);
                }
            });
        });

        // Prevent clicks on disabled buttons
        document.querySelectorAll('.buy-btn.disabled, .borrow-btn.disabled').forEach(button => {
            button.addEventListener('click', (e) => e.preventDefault());
        });
    }

    // Initial load
    filterBooks();

    // Navigation button handlers
    const viewBookNavBtn = document.getElementById('viewBookNavBtn');
    const addBookNavBtn = document.getElementById('addBookNavBtn');

    if (viewBookNavBtn) {
        viewBookNavBtn.addEventListener('click', function(event) {
            // Add your navigation logic here
        });
    }
});
    
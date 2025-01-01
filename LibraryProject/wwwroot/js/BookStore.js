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
            const borrowButton = book.isAvailableToBorrow
                ? (book.isReserved
                    ? (book.reservedForUsername === currentUsername  // currentUsername needs to be passed from controller
                        ? `<button class="borrow-btn" data-book-id="${book.bookId}">
                 Borrow Now (Reserved for you - Expires in ${Math.floor((new Date(book.reservationExpiry) - new Date()) / 60000)} minutes)
               </button>`
                        : `<div class="reserved-message">Reserved for another user</div>`)
                    : book.availableCopies > 0
                        ? `<button class="borrow-btn" data-book-id="${book.bookId}">Borrow</button>`
                        : `<button class="queue-btn" data-book-id="${book.bookId}">Join Queue</button>`)
                : '';
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
                             src="${book.imageUrl
                            ? (book.imageUrl.startsWith('http')
                                ? book.imageUrl
                                : `/images/BookCovers/${book.imageUrl}`)
                            : '/images/book-placeholder.jpg'}"
                             alt="${book.title}"
                             onerror="this.onerror=null; this.src='/images/book-placeholder.jpg';"
                        />
                    ${book.isAvailableToBorrow && book.availableCopies === 0 ?
                `<div class="sf-product-card__queue" data-book-id="${book.bookId}" title="Join Waiting List For Borrow">
        <i class="fas fa-clock"></i>
    </div>` : ''
            }
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

        const dialogHTML = `
        <div id="waitingListDialog" class="custom-dialog">
            <div class="dialog-content">
                <div class="dialog-header">
                    <img class="dialog-book-image" id="dialogBookImage" src="" alt="Book cover">
                    <h3 id="dialogBookTitle"></h3>
                    <p id="dialogBookAuthor"></p>
                    <p class="dialog-price">Borrow Price: $<span id="dialogBorrowPrice"></span></p>
                </div>
                <div class="dialog-info">
                    <div id="newUserContent">
                        <h4>Important Information:</h4>
                        <ul>
                            <li>Current position in queue: #<span id="queuePosition"></span></li>
                            <li>You'll be notified by email when available</li>
                            <li>48 hours to borrow once notified</li>
                            <li>30-day maximum borrow period</li>
                        </ul>
                    </div>
                    <div id="existingUserContent" style="display: none;">
                        <p>You are currently in position #<span id="currentPosition"></span></p>
                        <p>Estimated wait time: <span id="estimatedWait"></span> days</p>
                        <p>Would you like to leave the waiting list?</p>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button id="mainActionBtn" class="join-btn">Join Queue</button>
                </div>
            </div>
        </div>`;

        // Insert dialog if not exists
        if (!document.getElementById('waitingListDialog')) {
            document.body.insertAdjacentHTML('beforeend', dialogHTML);
        }

        document.querySelectorAll('.sf-product-card__queue').forEach(button => {
            button.addEventListener('click', async function() {
                const bookId = parseInt(this.dataset.bookId);
                const card = this.closest('.sf-product-card');

                try {
                    const response = await fetch('/Book/CheckWaitingListStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bookId)
                    });

                    if (response.status === 401) {
                        if (confirm('Please log in to join the waiting list. Would you like to go to the login page?')) {
                            window.location.href = '/User/Login';
                        }
                        return;
                    }

                    const data = await response.json();
                    const dialog = document.getElementById('waitingListDialog');
                    const mainActionBtn = document.getElementById('mainActionBtn');

                    // Update dialog content
                    document.getElementById('dialogBookImage').src = card.querySelector('.sf-product-card__image').src;
                    document.getElementById('dialogBookTitle').textContent = card.querySelector('.sf-product-card__title').textContent;
                    document.getElementById('dialogBookAuthor').textContent = card.querySelector('.sf-product-card__author').textContent;

                    // Find borrow price specifically
                    const priceElements = card.querySelectorAll('.price');
                    const borrowPrice = Array.from(priceElements)
                        .find(el => el.textContent.includes('Borrow:'))
                        ?.textContent.match(/\d+\.\d+/)[0];
                    document.getElementById('dialogBorrowPrice').textContent = borrowPrice || '0.00';

                    // Show appropriate content
                    if (data.isInQueue) {
                        document.getElementById('newUserContent').style.display = 'none';
                        document.getElementById('existingUserContent').style.display = 'block';
                        document.getElementById('currentPosition').textContent = data.position;
                        document.getElementById('estimatedWait').textContent = Math.ceil(data.position / 3) * 30;
                        mainActionBtn.textContent = 'Leave Queue';
                        mainActionBtn.className = 'remove-btn';
                    } else {
                        document.getElementById('newUserContent').style.display = 'block';
                        document.getElementById('existingUserContent').style.display = 'none';
                        document.getElementById('queuePosition').textContent = data.totalInQueue + 1;
                        mainActionBtn.textContent = 'Join Queue';
                        mainActionBtn.className = 'join-btn';
                    }

                    dialog.style.display = 'flex';

                    // Handle button clicks
                    mainActionBtn.onclick = async () => {
                        const endpoint = data.isInQueue ? '/Book/RemoveFromWaitingList' : '/Book/AddToWaitingList';
                        try {
                            const actionResponse = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(bookId)
                            });

                            if (actionResponse.ok) {
                                dialog.style.display = 'none';
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'success-message';
                                messageDiv.textContent = data.isInQueue ?
                                    'Successfully removed from waiting list!' :
                                    'Successfully added to waiting list!';
                                messageDiv.style.position = 'fixed';
                                messageDiv.style.top = '20px';
                                messageDiv.style.left = '50%';
                                messageDiv.style.transform = 'translateX(-50%)';
                                messageDiv.style.zIndex = '9999';
                                document.body.appendChild(messageDiv);

                                setTimeout(() => messageDiv.remove(), 3000);
                                await filterBooks();
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'error-message';
                            messageDiv.textContent = error.message || 'Error processing request';
                            messageDiv.style.position = 'fixed';
                            messageDiv.style.top = '20px';
                            messageDiv.style.left = '50%';
                            messageDiv.style.transform = 'translateX(-50%)';
                            messageDiv.style.zIndex = '9999';
                            document.body.appendChild(messageDiv);

                            setTimeout(() => messageDiv.remove(), 3000);
                        }
                    };

                    dialog.querySelector('.cancel-btn').onclick = () => {
                        dialog.style.display = 'none';
                    };
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(this, 'Error checking queue status', false);
                }
            });
        });
        
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
        });
    }
});

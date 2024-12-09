document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.sf-search__input');
    const searchButton = document.querySelector('.sf-search__button');
    const filterButtons = document.querySelectorAll('.sf-filter__btn');
    let currentGenre = 'all';

    // Filter functionality
    async function filterBooks(genre, searchQuery = '') {
        try {
            const response = await fetch(`/Book/FilterBooks?genre=${genre}&searchQuery=${searchQuery}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const books = await response.json();
            updateBookDisplay(books);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Update active filter button
    function updateFilterButtons(selectedGenre) {
        filterButtons.forEach(btn => {
            btn.classList.toggle('sf-filter__btn--active',
                btn.dataset.genre === selectedGenre);
        });
    }

    // Update book display
    function updateBookDisplay(books) {
        const productsContainer = document.querySelector('.sf-products');
        productsContainer.innerHTML = ''; // Clear current books

        if (books.length === 0) {
            productsContainer.innerHTML = '<div class="no-results">No books found</div>';
            return;
        }

        books.forEach(book => {
            const bookCard = `
                <div class="sf-product-card ${book.genre}">
                    <div class="sf-product-card__image-wrapper">
                        <img class="sf-product-card__image" src="/images/book-placeholder.jpg" alt="${book.title}" />
                    </div>
                    <div class="sf-product-card__content">
                        <h5 class="sf-product-card__title">${book.title}</h5>
                        <p class="sf-product-card__author">by ${book.author}</p>
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
                `<button class="buy-btn" data-book-id="${book.bookId}">Buy</button>` : ''}
                            ${book.isAvailableToBorrow && book.availableCopies > 0 ?
                `<button class="borrow-btn" data-book-id="${book.bookId}">Borrow</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += bookCard;
        });
    }

    // Event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentGenre = button.dataset.genre;
            updateFilterButtons(currentGenre);
            filterBooks(currentGenre, searchInput.value);
        });
    });

    searchButton.addEventListener('click', () => {
        filterBooks(currentGenre, searchInput.value);
    });

    // Search on enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterBooks(currentGenre, searchInput.value);
        }
    });

    // Initial load
    filterBooks('all', '');
});
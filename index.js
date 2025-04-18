document.addEventListener('DOMContentLoaded', () => {

    const bookContainer = document.getElementById('book-container');
    const totalBooksEl = document.getElementById('total-books');
    const booksReadEl = document.getElementById('books-read');
    const currentlyReadingEl = document.getElementById('currently-reading');
    const toReadEl = document.getElementById('to-read');
    const statusFilter = document.getElementById('status-filter');
    const sortBooks = document.getElementById('sort-books');
    const searchBooksInput = document.getElementById('search-books');
    const addBookBtn = document.getElementById('add-book-btn');
    const addBookModal = document.getElementById('add-book-modal');
    const closeAddModalBtn = document.getElementById('close-add-modal');
    const cancelAddBtn = document.getElementById('cancel-add');
    const addBookForm = document.getElementById('add-book-form');
    const modalBookStatus = document.getElementById('book-status');
    const modalRatingContainer = document.getElementById('rating-container');


    const API_URL = 'http://localhost:3000/books';

    let allBooks = [];
    let currentFilter = 'all';
    let currentSort = 'title';
    let currentSearchTerm = '';


    async function fetchBooks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const books = await response.json();
            allBooks = books;
            applyFiltersAndRender();
            updateStats();
        } catch (error) {
            console.error("Failed to fetch books:", error);
            bookContainer.innerHTML = '<p class="error-message">Could not load books. Is the API server running?</p>';
        }
    }

    function renderBooks(booksToRender) {
        bookContainer.innerHTML = '';

        if (booksToRender.length === 0) {
            bookContainer.innerHTML = '<p>No books match your criteria.</p>';
            return;
        }

        booksToRender.forEach(book => {
            const bookCard = createBookCardElement(book);
            bookContainer.appendChild(bookCard);
        });
    }


    function createBookCardElement(book) {
        const card = document.createElement('div');
        const searchQuery = `${book.title} ${book.author || ''}`; 
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        card.classList.add('book-card');
        card.dataset.id = book.id; 

        const coverUrl = book.coverImage || 'https://via.placeholder.com/150x220.png?text=No+Cover'; 


        const displayStatus = book.status === 'want to read' ? 'to-read' : book.status;

        card.innerHTML = `
            <img src="${coverUrl}" alt="Cover of ${book.title}" class="book-cover">
            <div class="book-info">
                <h3><a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="book-title-link">${book.title}</a></h3>
                <p>by ${book.author || 'Unknown Author'}</p>
                <p>Genre: ${book.genre || 'N/A'}</p>
                <p>Pages: ${book.pages || 'N/A'}</p>
                <div class="book-status-controls">
                    <label for="status-${book.id}">Status:</label>
                    <select id="status-${book.id}" class="book-status-select" data-book-id="${book.id}">
                        <option value="to-read" ${displayStatus === 'to-read' ? 'selected' : ''}>To Read</option>
                        <option value="reading" ${displayStatus === 'reading' ? 'selected' : ''}>Reading</option>
                        <option value="read" ${displayStatus === 'read' ? 'selected' : ''}>Read</option>
                    </select>
                </div>
                <div class="book-rating ${displayStatus === 'read' ? '' : 'hidden'}">
                    Rating: ${generateStarRating(book.rating || 0)}
                </div>
                <div class="book-notes">
                    <h4>Notes:</h4>
                    <p>${book.notes || 'No notes yet.'}</p>
                </div>
                <button class="like-button" aria-label="Like this book">🤍 Like</button>
            </div>
        `;

        const statusSelect = card.querySelector('.book-status-select');
        statusSelect.addEventListener('change', handleBookStatusChange);

        const likeButton = card.querySelector('.like-button');
        likeButton.addEventListener('click', (event) => {
            if (likeButton.textContent.includes('🤍')) {
                likeButton.textContent = '❤️ Liked!';
                likeButton.classList.add('liked');
            } else {
                likeButton.textContent = '🤍 Like';
                likeButton.classList.remove('liked');
            }
        });


        return card;
    }


    function generateStarRating(rating) {
        let stars = '';
        const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
        for (let i = 1; i <= 5; i++) {
            stars += `<span class="star">${i <= filledStars ? '★' : '☆'}</span>`;
        }
        return stars;
    }


    function updateStats() {
        const total = allBooks.length;
        const readCount = allBooks.filter(book => book.status === 'read').length;
        const readingCount = allBooks.filter(book => book.status === 'reading').length;
        const toReadCount = allBooks.filter(book => book.status === 'to-read' || book.status === 'want to read').length;

        totalBooksEl.textContent = total;
        booksReadEl.textContent = readCount;
        currentlyReadingEl.textContent = readingCount;
        toReadEl.textContent = toReadCount;
    }


    function applyFiltersAndRender() {
        let filteredBooks = [...allBooks];

  
        if (currentFilter !== 'all') {
            const filterValue = currentFilter === 'to-read' ? ['to-read', 'want to read'] : [currentFilter];
            filteredBooks = filteredBooks.filter(book => filterValue.includes(book.status));
        }

        if (currentSearchTerm) {
            const lowerCaseSearch = currentSearchTerm.toLowerCase();
            filteredBooks = filteredBooks.filter(book =>
                (book.title && book.title.toLowerCase().includes(lowerCaseSearch)) ||
                (book.author && book.author.toLowerCase().includes(lowerCaseSearch))
            );
        }


        const sortedBooks = filteredBooks.slice().sort((a, b) => {
            switch (currentSort) {
                case 'author':
                   const authorA = a.author || '';
                    const authorB = b.author || '';
                    return authorA.localeCompare(authorB);
                case 'rating':
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    return ratingB - ratingA;
                case 'title': 
                default:
                    const titleA = a.title || '';
                    const titleB = b.title || '';
                    return titleA.localeCompare(titleB);
            }
        });


        renderBooks(sortedBooks);
    }


    function handleFilterChange(event) {
        currentFilter = event.target.value;
        applyFiltersAndRender();
    }


    function handleSortChange(event) {
        currentSort = event.target.value;
        applyFiltersAndRender();
    }


    function handleSearchInput(event) {
        currentSearchTerm = event.target.value;
        applyFiltersAndRender();
    }


    function showAddBookModal() {
        addBookModal.style.display = 'block';
        addBookForm.reset();
        modalRatingContainer.style.display = 'none';
    }

    function hideAddBookModal() {
        addBookModal.style.display = 'none';
    }


    async function handleAddBookSubmit(event) {
        event.preventDefault();

        const statusValue = addBookForm.elements['book-status'].value;
        const ratingValue = addBookForm.elements['book-rating'].value;

        const newBook = {
            title: addBookForm.elements['book-title'].value,
            author: addBookForm.elements['book-author'].value,
            coverImage: addBookForm.elements['book-cover'].value || null, 
            genre: addBookForm.elements['book-genre'].value,
            pages: parseInt(addBookForm.elements['book-pages'].value, 10),
            status: statusValue,
            rating: (statusValue === 'read' && ratingValue) ? parseInt(ratingValue, 10) : 0,
            notes: addBookForm.elements['book-notes'].value,
        };

        if (!newBook.title || !newBook.author) {
            alert('Please fill in at least Title and Author.');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const addedBook = await response.json();
            allBooks.push(addedBook);

            applyFiltersAndRender();
            updateStats();
            hideAddBookModal();

        } catch (error) {
            console.error("Failed to add book:", error);
            alert('Failed to add book. Please check console for details.');
        }
    }


    async function handleBookStatusChange(event) {
        const selectElement = event.target;
        const bookId = selectElement.dataset.bookId;
        const newStatus = selectElement.value;

  
        const bookIndex = allBooks.findIndex(book => book.id == bookId); 
        if (bookIndex === -1) return; 

        const updatedFields = { status: newStatus };


        try {
            const response = await fetch(`${API_URL}/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFields),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedBook = await response.json();

            allBooks[bookIndex] = updatedBook;

            updateStats();
            applyFiltersAndRender();


        } catch (error) {
            console.error(`Failed to update status for book ID ${bookId}:`, error);
            alert('Failed to update book status. Please try again.');

            selectElement.value = allBooks[bookIndex].status === 'want to read' ? 'to-read' : allBooks[bookIndex].status;
        }
    }

     function handleModalStatusChange() {
        if (modalBookStatus.value === 'read') {
            modalRatingContainer.style.display = 'block';
        } else {
            modalRatingContainer.style.display = 'none';
             addBookForm.elements['book-rating'].value = '';
        }
    }


    statusFilter.addEventListener('change', handleFilterChange);
    sortBooks.addEventListener('change', handleSortChange);
    searchBooksInput.addEventListener('input', handleSearchInput);
    addBookBtn.addEventListener('click', showAddBookModal);
    closeAddModalBtn.addEventListener('click', hideAddBookModal);
    cancelAddBtn.addEventListener('click', hideAddBookModal);
    addBookForm.addEventListener('submit', handleAddBookSubmit);
    modalBookStatus.addEventListener('change', handleModalStatusChange);

    fetchBooks();

}); 
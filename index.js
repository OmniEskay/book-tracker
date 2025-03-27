document.addEventListener('DOMContentLoaded', () =>{

    const bookContainer = document.getElementById('book-container');

    const API_URL = 'http://localhost:3000/books';

    let allBooks = [];
    let currentFilter = 'aall';
    let currentSort = 'title';
    let currentSearchTerm = '';

    
    async function fetchBooks(){
        try{
            const response = await fetch(API_URL);
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const books = await response.json();
            allBooks = books;
            applyFiltersAndRender();
            updateStats();
        } catch (error) {
            console.error("Failed to fetch books", error);
            bookContainer.innerHTMK = '<p class = "errror-message">Could not load books. Is the API server runnning?</p>'
        }
    }

function renderBooks(booksToRender){
    bookContainer.innerHTML = '';

    if (booksToRender.length === 0){
        bookContainer.innerHTML = <p>No books match your criteria.</p>;
        return;
    }

    booksToRender.forEach(book => {
        const bookCard = createBookCardElement(book);
        bookContainer.appendChild(bookCard);
    });
}


function createBookCardElement(book){
    const card = document.createElement('div');
    card.classList.add('book-card');
    card.dataset.id = book.id;

    const coverUrl = book.coverImage || '';
    const displayStatus = book.status === 'want to read' ? 'to read' : book.status;

    card.innerHTML = `
        <img src="${coverUrl}" alt="Cover of ${book.title}" class="book-cover">
            <div class="book-info">
                <h3>${book.title}</h3>
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

}
})
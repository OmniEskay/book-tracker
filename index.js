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
})
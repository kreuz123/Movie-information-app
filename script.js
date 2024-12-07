// Fetch the list of theaters from Finnkino API
async function fetchTheaters() {
    try {
        const response = await fetch('https://www.finnkino.fi/xml/TheatreAreas/');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        // Parse the theater options and populate the dropdown
        const theaters = xml.getElementsByTagName("TheatreArea");
        const theaterSelect = document.getElementById("theater-select");

        Array.from(theaters).forEach(theater => {
            const id = theater.getElementsByTagName("ID")[0].textContent;
            const name = theater.getElementsByTagName("Name")[0].textContent;

            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            theaterSelect.appendChild(option);
        });

        // Add event listener for selection change
        theaterSelect.addEventListener("change", () => fetchMovies(theaterSelect.value));
    } catch (error) {
        console.error("Error fetching theaters:", error);
    }
}

// Fetch movies for a selected theater
async function fetchMovies(theaterId) {
    try {
        const response = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        // Parse movie data and display it
        const movies = xml.getElementsByTagName("Show");
        const movieList = document.getElementById("movie-list");
        movieList.innerHTML = ""; // Clear previous movies

        Array.from(movies).forEach(movie => {
            const title = movie.getElementsByTagName("Title")[0].textContent;
            const imageUrl = movie.getElementsByTagName("EventSmallImagePortrait")[0].textContent;
            const showTime = movie.getElementsByTagName("dttmShowStart")[0].textContent;

            // Create movie card
            const movieCard = document.createElement("div");
            movieCard.className = "movie";
            movieCard.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <h3>${title}</h3>
                <p>Showtime: ${new Date(showTime).toLocaleString()}</p>
            `;
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    fetchTheaters(); // Populate the theater dropdown
});

//Search
document.getElementById("movie-search").addEventListener("input", async (e) => {
    const query = e.target.value.trim(); // Trim to remove extra spaces
    const searchResults = document.getElementById("search-results");

    if (query.length > 2) {
        try {
            const response = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=718d4f42`);
            const data = await response.json();

            searchResults.innerHTML = ""; // clear searched result

            if (data.Search) {
                data.Search.forEach(movie => {
                    const movieCard = document.createElement("div");
                    movieCard.className = "movie";
                    movieCard.innerHTML = `
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <h3>${movie.Title}</h3>
                        <p>Year: ${movie.Year}</p>
                    `;
                    searchResults.appendChild(movieCard);
                });

                // add Clear Search button
                const clearButton = document.createElement("button");
                clearButton.textContent = "Clear Search";
              

                clearButton.addEventListener("click", () => {
                    searchResults.innerHTML = ""; // clearsearch result
                    e.target.value = ""; // clean search 
                });

                searchResults.appendChild(clearButton); // add Clear Search button to search result 
            } else {
                searchResults.innerHTML = "<p>No results found. Try a different search.</p>";
            }
        } catch (error) {
            console.error("Error fetching movie data:", error);
            searchResults.innerHTML = "<p>Error fetching movie data. Please try again later.</p>";
        }
    }
});


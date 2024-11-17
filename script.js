// Wait for the DOM to fully load before applying the transition class
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.navbar').classList.add('loaded');
});

const apiKey = 'DQJNoAS5k0D9jWFDSd7LXstDU3tfQLIF'; 
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('gif-search');
const gifContainer = document.getElementById('gif-container');
const trendingGifContainer = document.getElementById('trending-gif-container');

// Function to fetch trending GIFs
function fetchTrendingGifs() {
  const apiUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=12&rating=g`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const gifs = data.data;
      trendingGifContainer.innerHTML = ''; // Clear previous results

      // Check if we got results
      if (gifs.length > 0) {
        gifs.forEach(gif => {
          // Create link element
          const gifLink = document.createElement('a');
          gifLink.href = gif.url; // Giphy page link
          gifLink.target = '_blank'; // Open in a new tab
          gifLink.classList.add('gif-link');

          // Create image element
          const img = document.createElement('img');
          img.src = gif.images.fixed_height.url;
          img.alt = gif.title || 'GIF';

          // Add image to link
          gifLink.appendChild(img);

          // Add the link to the container
          trendingGifContainer.appendChild(gifLink);
        });
      } else {
        trendingGifContainer.innerHTML = '<p class="text-center text-muted">No trending GIFs available.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching trending GIFs:', error);
      trendingGifContainer.innerHTML = '<p class="text-center text-danger">There was an error fetching the trending GIFs. Please try again.</p>';
    });
}

window.onload = fetchTrendingGifs;






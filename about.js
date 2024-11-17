// Wait for the DOM to fully load before applying the transition class
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.navbar').classList.add('loaded');
});

const apiKey = 'DQJNoAS5k0D9jWFDSd7LXstDU3tfQLIF'; 
const cards = document.querySelector('.game-container');
let flippedCards = [];  // Store flipped cards
let matchedPairs = 0;  // Track the number of matched pairs
const gifCount = 8;  // Number of pairs (12 cards in total)

// Fetch GIFs from Giphy API
async function fetchGifs() {
  const gifArray = [];
  const response = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${gifCount}`);
  const data = await response.json();
  
  // Push the GIF URLs to the gifArray (each GIF should appear twice)
  data.data.forEach(gif => {
    gifArray.push(gif.images.fixed_height.url);
  });

  // Duplicate the array so each GIF has a pair
  return [...gifArray, ...gifArray].sort(() => Math.random() - 0.5);
}

// Create cards dynamically
async function createCards() {
  const gifs = await fetchGifs();
  cards.innerHTML = '';  // Clear any existing cards

  gifs.forEach((gif, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-card', gif);
    card.setAttribute('data-id', index);
    cards.appendChild(card);
  });

  // Add event listeners to cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('flipped') && flippedCards.length < 2) {
        flipCard(card);
      }
    });
  });
}

// Handle card flip
function flipCard(card) {
  card.style.backgroundImage = `url(${card.dataset.card})`;
  card.classList.add('flipped');
  flippedCards.push(card);

  // If two cards are flipped, check for a match
  if (flippedCards.length === 2) {
    checkMatch();
  }
}

// Check if the two flipped cards match
function checkMatch() {
  const [firstCard, secondCard] = flippedCards;

  // If they match
  if (firstCard.dataset.card === secondCard.dataset.card) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;

    // If all pairs are matched
    if (matchedPairs === gifCount) {
      setTimeout(() => {
        alert("You won!");
      }, 500);
    }
  } else {
    // If not a match, flip the cards back over
    setTimeout(() => {
      firstCard.style.backgroundImage = '';
      secondCard.style.backgroundImage = '';
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
    }, 1000);
  }

  // Reset the flipped cards array
  flippedCards = [];
}

// Reset the game
function resetGame() {
  flippedCards = [];
  matchedPairs = 0;
  createCards();  // Reinitialize the cards with new GIFs
}

// Initialize the game
createCards();

// Add event listener to reset button
document.getElementById('reset-button').addEventListener('click', resetGame);

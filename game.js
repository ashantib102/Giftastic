// Wait for the DOM to fully load before applying the transition class
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.navbar').classList.add('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const resetButton = document.getElementById('reset-button');
    const resultMessage = document.getElementById('result-message');
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    const TOTAL_PAIRS = 9;
    const API_KEY = 'AIzaSyBnYOSmt6iI7YAsT5DSfbMfOlleWoGmQao';
    const CLIENT_KEY = 'my_test_app';
    const matchedGifUrls = []; // Array to store matched GIF URLs

    // HTTP GET Async function
    function httpGetAsync(theUrl, callback) {
        const xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.responseText);
            }
        };

        xmlHttp.open('GET', theUrl, true);
        xmlHttp.send(null);
    }

    // Callback to process the Tenor API response
    function tenorCallback_search(responseText) {
        const responseObjects = JSON.parse(responseText);
        const gifResults = responseObjects['results'];

        // Extract GIF URLs
        const gifUrls = gifResults.map(gif => gif.media_formats.gif.url);

        // Initialize game with the fetched GIF URLs
        initializeGameWithGifs(gifUrls);
    }

    // Fetch GIFs using the Tenor API
    function fetchGifs() {
        const searchTerm = 'funny'; // Empty for trending or specific keyword like 'excited'
        const searchUrl = `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${API_KEY}&client_key=${CLIENT_KEY}&limit=${TOTAL_PAIRS}`;
        httpGetAsync(searchUrl, tenorCallback_search);
    }

    // Initialize game with the fetched GIFs
    function initializeGameWithGifs(gifUrls) {
        matchedPairs = 0;
        gameBoard.innerHTML = ''; // Clear the board

        // Duplicate and shuffle GIFs
        cards = [...gifUrls, ...gifUrls]
            .sort(() => Math.random() - 0.5)
            .map((gif, index) => ({
                id: index,
                gif,
                matched: false,
            }));

        // Render cards
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.id = card.id;

            const imgElement = document.createElement('img');
            imgElement.src = card.gif;
            imgElement.style.display = 'none'; // Initially hide the image
            cardElement.appendChild(imgElement);

            cardElement.addEventListener('click', () => handleCardClick(card, imgElement));
            gameBoard.appendChild(cardElement);
        });
    }

    // Handle card flip logic
    function handleCardClick(card, imgElement) {
        // If the card is already matched or if two cards are already flipped, don't allow further clicks
        if (card.matched || flippedCards.length === 2) return;

        // Show the card
        imgElement.style.display = 'block';
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }

    // Check if two flipped cards match
    function checkMatch() {
        const [card1, card2] = flippedCards;

        if (card1.gif === card2.gif) {
            // Mark the cards as matched
            card1.matched = true;
            card2.matched = true;

            // Keep them visible
            const img1 = document.querySelector(`.card[data-id='${card1.id}'] img`);
            const img2 = document.querySelector(`.card[data-id='${card2.id}'] img`);
            img1.style.display = 'block'; // Ensure the image stays visible
            img2.style.display = 'block'; // Ensure the image stays visible

            matchedPairs++;
            matchedGifUrls.push(card1.gif); // Store the matched GIF URL

            // If all pairs are matched, show the win message and enable hovering for URLs
            if (matchedPairs === TOTAL_PAIRS) {
                setTimeout(() => {
                    alert('Congratulations! You won!');
                    enableGifUrlHover(); // Enable hover effect to show URLs
                }, 500);
            }
        } else {
            // If they don't match, hide the images after a delay
            setTimeout(() => {
                const img1 = document.querySelector(`.card[data-id='${card1.id}'] img`);
                const img2 = document.querySelector(`.card[data-id='${card2.id}'] img`);

                // Only hide the images of cards that are not matched
                if (!card1.matched) img1.style.display = 'none';
                if (!card2.matched) img2.style.display = 'none';
            }, 1000);
        }

        // Reset flippedCards array to prepare for the next pair
        flippedCards = [];
    }

    // Function to enable hovering over matched cards
    function enableGifUrlHover() {
        const allCards = document.querySelectorAll('.card');

        allCards.forEach(cardElement => {
            const cardId = cardElement.dataset.id;
            const card = cards.find(c => c.id == cardId);

            if (card.matched) {
                // Display the URL when hovering over the card
                cardElement.addEventListener('mouseenter', () => {
                    const gifUrl = card.gif;
                    cardElement.title = gifUrl; // Display the URL as a tooltip (hover over)
                });

                // Open the URL in a new tab when the card is clicked
                cardElement.addEventListener('click', () => {
                    window.open(card.gif, '_blank'); // Open the GIF URL in a new tab
                });
            }
        });
    }

    // Reset button to fetch new GIFs and start a new game
    resetButton.addEventListener('click', fetchGifs);

    // Start the game by fetching GIFs
    fetchGifs();
});

/*
const puzzleBoard = document.getElementById('puzzle-board');
    const successMessage = document.getElementById('puzzle-success-message');
    const newGameButton = document.getElementById('new-game-button');
    const TOTAL_PIECES = 9; // 3x3 grid
    const API_KEY = 'AIzaSyBnYOSmt6iI7YAsT5DSfbMfOlleWoGmQao';
    let gifUrl = '';
    let puzzlePieces = [];

    // Fetch a random GIF from Tenor API
    function fetchRandomGif() {
      const searchTerm = 'funny';  // You can change this to any keyword like 'cute', 'animals', etc.
      const searchUrl = `https://api.tenor.com/v1/search?q=${searchTerm}&key=${API_KEY}&limit=1`;
      
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          gifUrl = data.results[0].media[0].gif.url;
          generatePuzzle(gifUrl);
        })
        .catch(error => console.error('Error fetching GIF:', error));
    }

    // Create the puzzle pieces by slicing the GIF into smaller parts
    function generatePuzzle(gifUrl) {
      puzzlePieces = [];
      puzzleBoard.innerHTML = ''; // Clear the puzzle board
      successMessage.style.visibility = 'hidden'; // Hide success message

      const img = new Image();
      img.src = gifUrl;
      img.onload = function() {
        // Split the image into 9 pieces (3x3 grid)
        const pieceWidth = img.width / 3;
        const pieceHeight = img.height / 3;

        for (let i = 0; i < TOTAL_PIECES; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;

          const canvas = document.createElement('canvas');
          canvas.width = pieceWidth;
          canvas.height = pieceHeight;
          const context = canvas.getContext('2d');
          context.drawImage(img, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

          const puzzlePiece = document.createElement('div');
          puzzlePiece.classList.add('puzzle-piece');
          puzzlePiece.draggable = true;
          puzzlePiece.dataset.index = i;

          const imgElement = document.createElement('img');
          imgElement.src = canvas.toDataURL();
          puzzlePiece.appendChild(imgElement);
          puzzlePiece.addEventListener('dragstart', onDragStart);
          puzzlePiece.addEventListener('dragover', onDragOver);
          puzzlePiece.addEventListener('drop', onDrop);
          puzzleBoard.appendChild(puzzlePiece);

          puzzlePieces.push(puzzlePiece);
        }

        // Shuffle the puzzle pieces
        shufflePuzzle();
      };
    }

    // Shuffle the puzzle pieces
    function shufflePuzzle() {
      for (let i = puzzlePieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
        puzzleBoard.appendChild(puzzlePieces[i]);
      }
    }

    // Drag and drop event handlers
    function onDragStart(e) {
      e.dataTransfer.setData('text', e.target.dataset.index);
    }

    function onDragOver(e) {
      e.preventDefault();
    }

    function onDrop(e) {
      const draggedIndex = e.dataTransfer.getData('text');
      const droppedIndex = e.target.dataset.index;

      if (draggedIndex === droppedIndex) return;

      // Swap the positions of the puzzle pieces
      const draggedPiece = puzzlePieces[draggedIndex];
      const droppedPiece = puzzlePieces[droppedIndex];

      puzzleBoard.insertBefore(droppedPiece, draggedPiece);
      puzzleBoard.insertBefore(draggedPiece, droppedPiece);

      checkIfPuzzleSolved();
    }

    // Check if the puzzle is solved
    function checkIfPuzzleSolved() {
      let isSolved = true;
      for (let i = 0; i < puzzlePieces.length; i++) {
        if (puzzlePieces[i].dataset.index != i) {
          isSolved = false;
          break;
        }
      }

      if (isSolved) {
        successMessage.style.visibility = 'visible';

        // Make the whole puzzle clickable once solved
        puzzleBoard.addEventListener('click', openGifUrl);
      }
    }

    // Open the GIF URL in a new tab
    function openGifUrl() {
      window.open(gifUrl, '_blank');
    }

    // Reset the game
    newGameButton.addEventListener('click', () => {
      fetchRandomGif(); // Fetch a new GIF and start the game
    });

    // Start a new game
    fetchRandomGif();
    */
const puzzleBoard = document.getElementById('puzzle-board');
const successMessage = document.getElementById('puzzle-success-message');
const newGameButton = document.getElementById('new-game-button');
const TOTAL_PIECES = 9; // 3x3 grid
const API_KEY = 'DQJNoAS5k0D9jWFDSd7LXstDU3tfQLIF';  // Giphy API key
let gifUrl = '';
let puzzlePieces = [];

// Array of search terms to randomly choose from
const searchTerms = [
  'cute animals',
  'funny cats',
  'puppies',
  'nature',
  'beautiful landscapes',
  'cute baby animals',
  'funny dogs',
  'amazing places',
  'cute pandas',
  'funny babies'
];

function getRandomSearchTerm() {
  const randomIndex = Math.floor(Math.random() * searchTerms.length);
  return searchTerms[randomIndex];
}

function fetchRandomGif() {
  // Get a random offset to avoid getting the same GIFs repeatedly
  const randomOffset = Math.floor(Math.random() * 50);
  const searchTerm = getRandomSearchTerm();
  const searchUrl = `https://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=${API_KEY}&limit=1&offset=${randomOffset}&rating=g`;

  // Show loading state
  puzzleBoard.innerHTML = '<div style="text-align: center; padding: 20px;">Loading new puzzle...</div>';

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.length > 0) {
        gifUrl = data.data[0].images.original.url;
        generatePuzzle(gifUrl);
      } else {
        // If no results, try again with a different search term
        fetchRandomGif();
      }
    })
    .catch(error => {
      console.error('Error fetching GIF:', error);
      puzzleBoard.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading puzzle. Please try again.</div>';
    });
}

function generatePuzzle(gifUrl) {
  puzzlePieces = [];
  puzzleBoard.innerHTML = '';
  successMessage.style.visibility = 'hidden';

  const img = new Image();
  img.src = gifUrl;
  img.crossOrigin = 'Anonymous';

  img.onload = function() {
    const pieceWidth = Math.floor(img.width / 3);
    const pieceHeight = Math.floor(img.height / 3);

    // Create container with fixed dimensions
    puzzleBoard.style.width = `${pieceWidth * 3}px`;
    puzzleBoard.style.height = `${pieceHeight * 3}px`;
    puzzleBoard.style.display = 'grid';
    puzzleBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
    puzzleBoard.style.gap = '1px';

    for (let i = 0; i < TOTAL_PIECES; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;

      const canvas = document.createElement('canvas');
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;
      const context = canvas.getContext('2d');
      context.drawImage(img, 
        col * pieceWidth, row * pieceHeight, 
        pieceWidth, pieceHeight, 
        0, 0, 
        pieceWidth, pieceHeight
      );

      const puzzlePiece = document.createElement('div');
      puzzlePiece.classList.add('puzzle-piece');
      puzzlePiece.draggable = true;
      puzzlePiece.dataset.originalIndex = i;  // Store original position
      puzzlePiece.dataset.currentIndex = i;   // Store current position

      const imgElement = document.createElement('img');
      imgElement.src = canvas.toDataURL();
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      imgElement.style.pointerEvents = 'none';  // Prevent img from interfering with drag
      
      puzzlePiece.appendChild(imgElement);
      puzzlePieces.push(puzzlePiece);
    }

    // Add event listeners after creating all pieces
    puzzlePieces.forEach(piece => {
      piece.addEventListener('dragstart', onDragStart);
      piece.addEventListener('dragend', onDragEnd);
      piece.addEventListener('dragover', onDragOver);
      piece.addEventListener('drop', onDrop);
      puzzleBoard.appendChild(piece);
    });

    shufflePuzzle();
  };

  // Add error handling for image loading
  img.onerror = function() {
    puzzleBoard.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading image. Trying another...</div>';
    fetchRandomGif();
  };
}

function shufflePuzzle() {
  const shuffledIndices = [...Array(TOTAL_PIECES).keys()];
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }

  // Update positions based on shuffled indices
  shuffledIndices.forEach((newIndex, currentIndex) => {
    const piece = puzzlePieces[currentIndex];
    piece.dataset.currentIndex = newIndex;
    piece.style.order = newIndex;  // Use CSS grid order for positioning
  });
}

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.currentIndex);
  e.target.classList.add('dragging');
}

function onDragEnd(e) {
  e.target.classList.remove('dragging');
}

function onDragOver(e) {
  e.preventDefault();
}

function onDrop(e) {
  e.preventDefault();
  
  const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
  const dropTarget = e.target.closest('.puzzle-piece');
  
  if (!dropTarget || draggedIndex === parseInt(dropTarget.dataset.currentIndex)) {
    return;
  }

  const droppedIndex = parseInt(dropTarget.dataset.currentIndex);
  
  // Swap the pieces using CSS grid order
  const draggedPiece = puzzlePieces.find(piece => 
    parseInt(piece.dataset.currentIndex) === draggedIndex
  );
  const droppedPiece = puzzlePieces.find(piece => 
    parseInt(piece.dataset.currentIndex) === droppedIndex
  );

  // Swap current indices and order
  [draggedPiece.dataset.currentIndex, droppedPiece.dataset.currentIndex] = 
    [droppedPiece.dataset.currentIndex, draggedPiece.dataset.currentIndex];
  
  draggedPiece.style.order = droppedIndex;
  droppedPiece.style.order = draggedIndex;

  checkIfPuzzleSolved();
}

function checkIfPuzzleSolved() {
  const isSolved = puzzlePieces.every(piece => 
    piece.dataset.currentIndex === piece.dataset.originalIndex
  );

  if (isSolved) {
    successMessage.style.visibility = 'visible';
    puzzleBoard.addEventListener('click', openGifUrl);
  }
}

function openGifUrl() {
  window.open(gifUrl, '_blank');
}

newGameButton.addEventListener('click', fetchRandomGif);

// Start the game
fetchRandomGif();
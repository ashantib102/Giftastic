
  // Wait for the DOM to fully load before applying the transition class
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.navbar').classList.add('loaded');
  });


const apiKey = 'DQJNoAS5k0D9jWFDSd7LXstDU3tfQLIF'; // Replace with your Giphy API Key
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const gifContainer = document.getElementById('gif-container');

// Function to fetch GIFs based on search query
async function fetchGifs(query) {
  const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=12&rating=g`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    renderGifs(data.data);
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    gifContainer.innerHTML = `<p class="error-message">Error fetching GIFs. Please try again later.</p>`;
  }
}

// Function to render GIFs
function renderGifs(gifs) {
  gifContainer.innerHTML = ''; // Clear previous results
  if (gifs.length === 0) {
    gifContainer.innerHTML = `<p class="error-message">No GIFs found. Try another keyword!</p>`;
    return;
  }

  gifs.forEach(gif => {
    // Anchor element wrapping the GIF
    const gifLink = document.createElement('a');
    gifLink.href = gif.url; // Giphy link
    gifLink.target = '_blank'; // Open in a new tab
    gifLink.classList.add('gif-link');

    // GIF Image
    const gifElement = document.createElement('img');
    gifElement.src = gif.images.fixed_height.url;
    gifElement.alt = gif.title || 'GIF';

    gifLink.appendChild(gifElement);
    gifContainer.appendChild(gifLink);
  });
}



// Handle form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchGifs(query);
  }
});

 const GIPHY_API_KEY = 'DQJNoAS5k0D9jWFDSd7LXstDU3tfQLIF';
        
 const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const loading = document.getElementById('loading');
        const captions = document.getElementById('captions');

        // Handle drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('dragover');
        }

        function unhighlight(e) {
            dropZone.classList.remove('dragover');
        }

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            
            if (file && file.type === 'image/gif') {
                handleFile(file);
            } else {
                showError('Please upload a GIF file');
            }
        }

        // Handle click to browse
        document.querySelector('.browse-button').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'image/gif') {
                handleFile(file);
            } else {
                showError('Please select a GIF file');
            }
        });

        function showError(message) {
            captions.innerHTML = `<div class="error">${message}</div>`;
        }

        async function handleFile(file) {
            // Clear previous error messages
            captions.innerHTML = '';
            
            // Display preview
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Selected GIF">`;
            };
            reader.readAsDataURL(file);

            // Upload to Giphy and get captions
            await uploadAndGetCaption(file);
        }

        async function uploadAndGetCaption(file) {
            loading.style.display = 'block';
            captions.innerHTML = '';

            try {
                // First, upload the GIF to Giphy
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', GIPHY_API_KEY);

                const uploadResponse = await fetch('https://upload.giphy.com/v1/gifs', {
                    method: 'POST',
                    body: formData
                });

                const uploadData = await uploadResponse.json();

                if (uploadData.data.id) {
                    // Get GIF information including tags and captions
                    const gifResponse = await fetch(
                        `https://api.giphy.com/v1/gifs/${uploadData.data.id}?api_key=${GIPHY_API_KEY}`
                    );
                    const gifData = await gifResponse.json();

                    // Display tags and title as captions
                    const tags = gifData.data.tags || [];
                    const title = gifData.data.title || '';

                    let captionsHTML = '<h3>Generated Captions:</h3>';
                    if (title) {
                        captionsHTML += `<p><strong>Title:</strong> ${title}</p>`;
                    }
                    if (tags.length > 0) {
                        captionsHTML += `<p><strong>Tags:</strong> ${tags.join(', ')}</p>`;
                    }

                    captions.innerHTML = captionsHTML;
                }
            } catch (error) {
                showError(`Error: ${error.message}`);
            } finally {
                loading.style.display = 'none';
            }
        }
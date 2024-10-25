document.getElementById('shortlinkForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const longUrl = document.getElementById('longUrl').value;
  const name = document.getElementById('name').value;

  try {
    const response = await fetch('/url/create-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl, name })
    });
    const result = await response.json();

    if (result.success) {
      const shortUrl = result.data.shortUrl;
      document.getElementById('shortlinkOutput').textContent = `Short URL: ${shortUrl}`;
      document.getElementById('shortlinkResult').style.display = 'block';
    } else {
      alert('Error creating short URL');
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    alert('An error occurred. Please try again.');
  }
});

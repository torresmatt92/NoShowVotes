// Vercel Serverless Function — proxies 5calls.org API
// Solves CORS issue — app calls /api/representatives?zip=91768
// This runs on the server, not the browser

export default async function handler(req, res) {
  // Allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { zip } = req.query;

  if (!zip || zip.length < 5) {
    return res.status(400).json({ error: 'Invalid zip code' });
  }

  try {
    const response = await fetch(
      `https://api.5calls.org/v1/representatives?location=${zip}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NoShowVotes/1.0 (noshowvotes.com)',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`5calls API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Representative lookup error:', error);
    return res.status(500).json({ error: 'Could not fetch representatives' });
  }
}

// Vercel Serverless Function — proxies LegiScan roll call data
// Keeps LegiScan API key secure on server side
// App calls /api/rollcall?person_id=1234

const LEGISCAN_KEY = '5702fe69a369cb854161cee03c1d3b8c';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { person_id, state } = req.query;

  if (!person_id) {
    return res.status(400).json({ error: 'person_id required' });
  }

  try {
    // Get sponsored bills for this legislator
    const response = await fetch(
      `https://api.legiscan.com/?key=${LEGISCAN_KEY}&op=getSponsoredList&id=${person_id}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) throw new Error('LegiScan error');

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Roll call error:', error);
    return res.status(500).json({ error: 'Could not fetch vote data' });
  }
}

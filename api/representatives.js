// Vercel Serverless Function — proxies WhoIsMyRepresentative.com API
// Free, no API key needed, works for every US zip code
// App calls /api/representatives?zip=92407

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { zip } = req.query;

  if (!zip || zip.length < 5) {
    return res.status(400).json({ error: 'Invalid zip code' });
  }

  try {
    const response = await fetch(
      `https://whoismyrepresentative.com/getall_mems.php?zip=${zip}&output=json`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NoShowVotes/1.0 (noshowvotes.com)',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to our standard format
    const results = data.results || [];
    const reps = results.map(r => ({
      name: r.name,
      party: r.party === "D" ? "Democrat" : r.party === "R" ? "Republican" : r.party,
      state: r.state,
      district: r.district || "Senate",
      phone: r.phone,
      link: r.link,
      office: r.office,
      // Determine role from district field
      area: r.district ? "US_HOUSE" : "US_SENATE",
    }));

    return res.status(200).json({ 
      representatives: reps,
      zip,
      state: results[0]?.state || ""
    });

  } catch (error) {
    console.error('Representative lookup error:', error);
    return res.status(500).json({ error: 'Could not fetch representatives' });
  }
}

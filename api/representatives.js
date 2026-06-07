// Vercel Serverless Function
// Fetches all levels of representatives for a zip code:
// 1. Current US Senators (hardcoded, always accurate)
// 2. US House rep (WhoIsMyRepresentative)
// 3. State Senator + Assembly Member (OpenStates API)

const OPENSTATES_KEY = "83410092-48c3-4e02-be6f-09a67d115cfe";

const CURRENT_SENATE = {
  "CA": [{ name:"Alex Padilla", party:"D" }, { name:"Adam Schiff", party:"D" }],
  "TX": [{ name:"John Cornyn", party:"R" }, { name:"Ted Cruz", party:"R" }],
  "NY": [{ name:"Chuck Schumer", party:"D" }, { name:"Kirsten Gillibrand", party:"D" }],
  "FL": [{ name:"Marco Rubio", party:"R" }, { name:"Rick Scott", party:"R" }],
  "IL": [{ name:"Dick Durbin", party:"D" }, { name:"Tammy Duckworth", party:"D" }],
  "PA": [{ name:"John Fetterman", party:"D" }, { name:"Dave McCormick", party:"R" }],
  "OH": [{ name:"Jon Husted", party:"R" }, { name:"Bernie Moreno", party:"R" }],
  "GA": [{ name:"Jon Ossoff", party:"D" }, { name:"Raphael Warnock", party:"D" }],
  "AZ": [{ name:"Mark Kelly", party:"D" }, { name:"Ruben Gallego", party:"D" }],
  "NV": [{ name:"Catherine Cortez Masto", party:"D" }, { name:"Jacky Rosen", party:"D" }],
  "CO": [{ name:"Michael Bennet", party:"D" }, { name:"John Hickenlooper", party:"D" }],
  "MI": [{ name:"Gary Peters", party:"D" }, { name:"Elissa Slotkin", party:"D" }],
  "WA": [{ name:"Patty Murray", party:"D" }, { name:"Maria Cantwell", party:"D" }],
  "OR": [{ name:"Ron Wyden", party:"D" }, { name:"Jeff Merkley", party:"D" }],
  "MN": [{ name:"Amy Klobuchar", party:"D" }, { name:"Tina Smith", party:"D" }],
  "NC": [{ name:"Thom Tillis", party:"R" }, { name:"Ted Budd", party:"R" }],
  "VA": [{ name:"Mark Warner", party:"D" }, { name:"Tim Kaine", party:"D" }],
  "MA": [{ name:"Elizabeth Warren", party:"D" }, { name:"Ed Markey", party:"D" }],
  "NJ": [{ name:"Andy Kim", party:"D" }, { name:"Cory Booker", party:"D" }],
  "WI": [{ name:"Tammy Baldwin", party:"D" }, { name:"Ron Johnson", party:"R" }],
  "TN": [{ name:"Marsha Blackburn", party:"R" }, { name:"Bill Hagerty", party:"R" }],
  "MO": [{ name:"Josh Hawley", party:"R" }, { name:"Eric Schmitt", party:"R" }],
  "IN": [{ name:"Todd Young", party:"R" }, { name:"Jim Banks", party:"R" }],
  "MD": [{ name:"Ben Cardin", party:"D" }, { name:"Angela Alsobrooks", party:"D" }],
  "SC": [{ name:"Lindsey Graham", party:"R" }, { name:"Tim Scott", party:"R" }],
  "AL": [{ name:"Tommy Tuberville", party:"R" }, { name:"Katie Britt", party:"R" }],
  "KY": [{ name:"Mitch McConnell", party:"R" }, { name:"Rand Paul", party:"R" }],
  "LA": [{ name:"Bill Cassidy", party:"R" }, { name:"John Kennedy", party:"R" }],
  "OK": [{ name:"James Lankford", party:"R" }, { name:"Markwayne Mullin", party:"R" }],
  "AR": [{ name:"John Boozman", party:"R" }, { name:"Tom Cotton", party:"R" }],
  "UT": [{ name:"Mike Lee", party:"R" }, { name:"John Curtis", party:"R" }],
  "IA": [{ name:"Chuck Grassley", party:"R" }, { name:"Joni Ernst", party:"R" }],
  "KS": [{ name:"Jerry Moran", party:"R" }, { name:"Roger Marshall", party:"R" }],
  "NE": [{ name:"Deb Fischer", party:"R" }, { name:"Pete Ricketts", party:"R" }],
  "WV": [{ name:"Shelley Moore Capito", party:"R" }, { name:"Jim Justice", party:"R" }],
  "MT": [{ name:"Steve Daines", party:"R" }, { name:"Tim Sheehy", party:"R" }],
  "ID": [{ name:"Mike Crapo", party:"R" }, { name:"Jim Risch", party:"R" }],
  "SD": [{ name:"John Thune", party:"R" }, { name:"Mike Rounds", party:"R" }],
  "ND": [{ name:"John Hoeven", party:"R" }, { name:"Kevin Cramer", party:"R" }],
  "WY": [{ name:"John Barrasso", party:"R" }, { name:"Cynthia Lummis", party:"R" }],
  "AK": [{ name:"Lisa Murkowski", party:"R" }, { name:"Dan Sullivan", party:"R" }],
  "HI": [{ name:"Brian Schatz", party:"D" }, { name:"Mazie Hirono", party:"D" }],
  "CT": [{ name:"Chris Murphy", party:"D" }, { name:"Richard Blumenthal", party:"D" }],
  "RI": [{ name:"Jack Reed", party:"D" }, { name:"Sheldon Whitehouse", party:"D" }],
  "DE": [{ name:"Tom Carper", party:"D" }, { name:"Chris Coons", party:"D" }],
  "NH": [{ name:"Jeanne Shaheen", party:"D" }, { name:"Maggie Hassan", party:"D" }],
  "ME": [{ name:"Susan Collins", party:"R" }, { name:"Angus King", party:"I" }],
  "VT": [{ name:"Bernie Sanders", party:"I" }, { name:"Peter Welch", party:"D" }],
  "NM": [{ name:"Martin Heinrich", party:"D" }, { name:"Ben Ray Luján", party:"D" }],
  "MS": [{ name:"Roger Wicker", party:"R" }, { name:"Cindy Hyde-Smith", party:"R" }],
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { zip } = req.query;
  if (!zip || zip.length < 5) {
    return res.status(400).json({ error: 'Invalid zip code' });
  }

  try {
    // 1. Get House rep from WhoIsMyRepresentative
    const houseRes = await fetch(
      `https://whoismyrepresentative.com/getall_reps_byzip.php?zip=${zip}&output=json`,
      { headers: { 'User-Agent': 'NoShowVotes/1.0 (noshowvotes.com)' } }
    );

    let houseReps = [];
    let state = "";

    if (houseRes.ok) {
      try {
        const houseData = await houseRes.json();
        const results = houseData.results || [];
        state = results[0]?.state || "";
        houseReps = results.map(r => ({
          name: r.name,
          party: r.party,
          state: r.state,
          district: r.district,
          area: "US_HOUSE"
        }));
      } catch(e) {}
    }

    // 2. Get state legislators from OpenStates
    let stateLegs = [];
    if (state || zip) {
      try {
        const osRes = await fetch(
          `https://v3.openstates.org/people.geo?lat=0&lng=0&apikey=${OPENSTATES_KEY}`,
          { headers: { 'X-API-KEY': OPENSTATES_KEY } }
        );
        // Use zip-based geo lookup
        const geoRes = await fetch(
          `https://v3.openstates.org/people?jurisdiction=${state?.toLowerCase()}&current_role_district=${zip}&apikey=${OPENSTATES_KEY}`,
          { headers: { 'X-API-KEY': OPENSTATES_KEY } }
        );

        // Better: use the geo endpoint with zip
        const zipGeoRes = await fetch(
          `https://v3.openstates.org/people.geo?zip=${zip}`,
          { headers: { 'X-API-KEY': OPENSTATES_KEY } }
        );

        if (zipGeoRes.ok) {
          const geoData = await zipGeoRes.json();
          const people = geoData.results || [];
          stateLegs = people
            .filter(p => {
              const chamber = p.current_role?.chamber || "";
              return chamber === "upper" || chamber === "lower";
            })
            .map(p => ({
              name: p.name,
              party: p.party === "Democratic" ? "D" : p.party === "Republican" ? "R" : "I",
              state: state,
              district: p.current_role?.district || "—",
              area: p.current_role?.chamber === "upper" ? "STATE_SENATE" : "STATE_HOUSE",
            }));
        }
      } catch(e) {
        console.error("OpenStates error:", e);
      }
    }

    // 3. Get current US Senators
    const senators = (CURRENT_SENATE[state] || []).map(s => ({
      ...s,
      state,
      district: "Senate",
      area: "US_SENATE"
    }));

    const allReps = [...senators, ...houseReps, ...stateLegs];

    return res.status(200).json({
      representatives: allReps,
      zip,
      state
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Could not fetch representatives' });
  }
}

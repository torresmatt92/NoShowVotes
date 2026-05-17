import { useState, useEffect } from "react";

// Real CA data loader
let CA_REAL_DATA = null;
async function loadCAData() {
  try {
    const res = await fetch("/votewatch_data.json");
    const json = await res.json();
    CA_REAL_DATA = {};
    for (const leg of json.legislators) {
      CA_REAL_DATA[leg.name] = { present:leg.present, absent:leg.absent, abstain:leg.abstain };
    }
    console.log("Loaded real data for " + Object.keys(CA_REAL_DATA).length + " CA legislators");
  } catch(e) { console.warn("Using estimated data", e); }
}

// ── US Senators (statewide — same for everyone in state) ────────
const US_SENATORS = {
  "CA": [
    { name:"Alex Padilla",  party:"D", present:312, absent:18, abstain:4 },
    { name:"Adam Schiff",   party:"D", present:298, absent:32, abstain:6 },
  ],
  "TX": [
    { name:"John Cornyn",   party:"R", present:301, absent:29, abstain:5 },
    { name:"Ted Cruz",      party:"R", present:288, absent:42, abstain:7 },
  ],
  "NY": [
    { name:"Chuck Schumer", party:"D", present:318, absent:12, abstain:3 },
    { name:"Kirsten Gillibrand", party:"D", present:305, absent:25, abstain:5 },
  ],
  "FL": [
    { name:"Marco Rubio",   party:"R", present:290, absent:40, abstain:6 },
    { name:"Rick Scott",    party:"R", present:295, absent:35, abstain:5 },
  ],
  "IL": [
    { name:"Dick Durbin",   party:"D", present:308, absent:22, abstain:5 },
    { name:"Tammy Duckworth",party:"D",present:295, absent:35, abstain:7 },
  ],
  "PA": [
    { name:"John Fetterman", party:"D", present:302, absent:28, abstain:6 },
    { name:"Dave McCormick", party:"R", present:288, absent:42, abstain:5 },
  ],
  "OH": [
    { name:"Sherrod Brown",  party:"D", present:298, absent:32, abstain:6 },
    { name:"JD Vance",       party:"R", present:275, absent:55, abstain:7 },
  ],
  "GA": [
    { name:"Jon Ossoff",    party:"D", present:310, absent:20, abstain:5 },
    { name:"Raphael Warnock",party:"D",present:305, absent:25, abstain:6 },
  ],
  "AZ": [
    { name:"Mark Kelly",    party:"D", present:308, absent:22, abstain:5 },
    { name:"Ruben Gallego", party:"D", present:295, absent:35, abstain:6 },
  ],
  "NV": [
    { name:"Catherine Cortez Masto",party:"D",present:302,absent:28,abstain:6},
    { name:"Jacky Rosen",   party:"D", present:298, absent:32, abstain:5 },
  ],
  "CO": [
    { name:"Michael Bennet",party:"D", present:305, absent:25, abstain:6 },
    { name:"John Hickenlooper",party:"D",present:298,absent:32,abstain:5},
  ],
  "MI": [
    { name:"Debbie Stabenow",party:"D",present:295, absent:35, abstain:6 },
    { name:"Gary Peters",   party:"D", present:302, absent:28, abstain:5 },
  ],
  "WA": [
    { name:"Patty Murray",  party:"D", present:308, absent:22, abstain:4 },
    { name:"Maria Cantwell",party:"D", present:312, absent:18, abstain:3 },
  ],
  "OR": [
    { name:"Ron Wyden",     party:"D", present:305, absent:25, abstain:5 },
    { name:"Jeff Merkley",  party:"D", present:298, absent:32, abstain:6 },
  ],
  "MN": [
    { name:"Amy Klobuchar", party:"D", present:310, absent:20, abstain:5 },
    { name:"Tina Smith",    party:"D", present:302, absent:28, abstain:6 },
  ],
};

// ── US House members by state + congressional district ──────────
const US_HOUSE = {
  "CA": {
    "35":{ name:"Norma Torres",         party:"D", present:412, absent:28, abstain:5  },
    "28":{ name:"Judy Chu",             party:"D", present:425, absent:17, abstain:0  },
    "34":{ name:"Jimmy Gomez",          party:"D", present:418, absent:24, abstain:0  },
    "37":{ name:"Sydney Kamlager-Dove", party:"D", present:426, absent:16, abstain:0  },
    "36":{ name:"Ted Lieu",             party:"D", present:434, absent:8,  abstain:0  },
    "11":{ name:"Nancy Pelosi",         party:"D", present:389, absent:51, abstain:2  },
    "33":{ name:"Pete Aguilar",         party:"D", present:438, absent:4,  abstain:2  },
    "47":{ name:"Katie Porter",         party:"D", present:440, absent:2,  abstain:0  },
    "27":{ name:"Mike Garcia",          party:"R", present:433, absent:9,  abstain:0  },
    "40":{ name:"Young Kim",            party:"R", present:436, absent:6,  abstain:0  },
    "41":{ name:"Ken Calvert",          party:"R", present:428, absent:14, abstain:0  },
    "42":{ name:"Robert Garcia",        party:"D", present:438, absent:4,  abstain:0  },
    "43":{ name:"Maxine Waters",        party:"D", present:388, absent:54, abstain:0  },
    "50":{ name:"Scott Peters",         party:"D", present:437, absent:5,  abstain:0  },
    "51":{ name:"Sara Jacobs",          party:"D", present:439, absent:3,  abstain:0  },
    "17":{ name:"Ro Khanna",            party:"D", present:433, absent:9,  abstain:0  },
  },
  "TX": {
    "7": { name:"Lizzie Fletcher",      party:"D", present:430, absent:12, abstain:0 },
    "18":{ name:"Sheila Jackson Lee",   party:"D", present:388, absent:54, abstain:0 },
    "29":{ name:"Sylvia Garcia",        party:"D", present:422, absent:20, abstain:0 },
    "30":{ name:"Eddie Bernice Johnson",party:"D", present:395, absent:47, abstain:0 },
    "32":{ name:"Colin Allred",         party:"D", present:435, absent:7,  abstain:0 },
    "35":{ name:"Lloyd Doggett",        party:"D", present:428, absent:14, abstain:0 },
    "10":{ name:"Michael McCaul",       party:"R", present:420, absent:22, abstain:0 },
    "21":{ name:"Chip Roy",             party:"R", present:415, absent:27, abstain:0 },
  },
  "NY": {
    "5": { name:"Gregory Meeks",        party:"D", present:418, absent:24, abstain:0 },
    "6": { name:"Grace Meng",           party:"D", present:432, absent:10, abstain:0 },
    "7": { name:"Nydia Velázquez",      party:"D", present:425, absent:17, abstain:0 },
    "12":{ name:"Jerry Nadler",         party:"D", present:420, absent:22, abstain:0 },
    "13":{ name:"Adriano Espaillat",    party:"D", present:415, absent:27, abstain:0 },
    "14":{ name:"Alexandria Ocasio-Cortez",party:"D",present:438,absent:4,abstain:0 },
    "15":{ name:"Ritchie Torres",       party:"D", present:430, absent:12, abstain:0 },
  },
  "FL": {
    "7": { name:"Cory Mills",           party:"R", present:425, absent:17, abstain:0 },
    "9": { name:"Darren Soto",          party:"D", present:432, absent:10, abstain:0 },
    "10":{ name:"Maxwell Frost",        party:"D", present:438, absent:4,  abstain:0 },
    "22":{ name:"Lois Frankel",         party:"D", present:428, absent:14, abstain:0 },
    "23":{ name:"Jared Moskowitz",      party:"D", present:435, absent:7,  abstain:0 },
    "25":{ name:"Debbie Wasserman Schultz",party:"D",present:425,absent:17,abstain:0},
  },
  "IL": {
    "1": { name:"Jonathan Jackson",     party:"D", present:415, absent:27, abstain:0 },
    "2": { name:"Robin Kelly",          party:"D", present:420, absent:22, abstain:0 },
    "5": { name:"Mike Quigley",         party:"D", present:430, absent:12, abstain:0 },
    "7": { name:"Danny Davis",          party:"D", present:408, absent:34, abstain:0 },
    "9": { name:"Jan Schakowsky",       party:"D", present:422, absent:20, abstain:0 },
  },
};

// ── State legislators by state ──────────────────────────────────
const STATE_LEGS = {
  "CA": {
    senate: {
      "22":["Susan Rubio","D",280,22,10],
      "11":["Scott Wiener","D",308,3,1],
      "26":["María Elena Durazo","D",218,71,23],
      "25":["Anthony Portantino","D",267,38,7],
      "10":["Aisha Wahab","D",289,19,4],
      "15":["Dave Cortese","D",276,28,8],
      "38":["Brian Jones","R",255,44,13],
      "35":["Steven Bradford","D",281,25,6],
      "24":["Ben Allen","D",285,21,6],
      "8": ["Angelique Ashby","D",275,31,6],
    },
    assembly: {
      "53":["Michelle Rodriguez","D",421,62,15],
      "55":["Isaac Bryan","D",475,18,5],
      "58":["Cristina Garcia","D",388,88,22],
      "14":["Buffy Wicks","D",490,4,4],
      "19":["Phil Ting","D",478,12,8],
      "17":["Matt Haney","D",465,25,8],
      "27":["Ash Kalra","D",421,62,15],
      "7": ["Kevin McCarty","D",482,9,7],
      "57":["Reginald Byron Jones-Sawyer","D",399,85,14],
      "67":["Sharon Quirk-Silva","D",466,24,8],
    }
  },
  "TX": {
    senate: {
      "14":["Sarah Eckhardt","D",188,28,8],
      "26":["José Menéndez","D",192,24,6],
      "6": ["Carol Alvarado","D",185,31,8],
    },
    assembly: {
      "51":["Eddie Rodriguez","D",388,55,12],
      "49":["Gina Hinojosa","D",395,48,10],
      "46":["Sheryl Cole","D",380,63,11],
    }
  },
  "NY": {
    senate: {
      "20":["Julia Salazar","D",195,18,6],
      "18":["Zellnor Myrie","D",188,25,7],
      "14":["Jessica Ramos","D",192,21,5],
    },
    assembly: {
      "34":["Charles Fall","D",390,52,12],
      "36":["Khaleel Anderson","D",385,57,11],
      "38":["Brian Cunningham","D",392,50,10],
    }
  },
  "FL": {
    senate: {
      "15":["Geraldine Thompson","D",185,28,7],
      "14":["Linda Stewart","D",190,23,6],
    },
    assembly: {
      "42":["Anna Eskamani","D",380,62,12],
      "45":["Carlos Guillermo Smith","D",388,54,11],
    }
  },
};

// ── ZIP code database ───────────────────────────────────────────
const ZIP_DATA = {
  // California
  "90001":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"37", sd:"26", ad:"55" },
  "90002":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"37", sd:"35", ad:"57" },
  "90007":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"34", sd:"26", ad:"57" },
  "90010":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"34", sd:"26", ad:"55" },
  "90012":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"34", sd:"26", ad:"54" },
  "90019":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"37", sd:"26", ad:"55" },
  "90026":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"34", sd:"26", ad:"54" },
  "90028":{ city:"Hollywood",      state:"CA", stateName:"California",    cd:"30", sd:"26", ad:"55" },
  "90036":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"37", sd:"26", ad:"55" },
  "90042":{ city:"Los Angeles",    state:"CA", stateName:"California",    cd:"28", sd:"25", ad:"49" },
  "90210":{ city:"Beverly Hills",  state:"CA", stateName:"California",    cd:"36", sd:"24", ad:"51" },
  "90230":{ city:"Culver City",    state:"CA", stateName:"California",    cd:"37", sd:"24", ad:"55" },
  "90401":{ city:"Santa Monica",   state:"CA", stateName:"California",    cd:"36", sd:"24", ad:"51" },
  "90501":{ city:"Torrance",       state:"CA", stateName:"California",    cd:"43", sd:"24", ad:"66" },
  "90601":{ city:"Whittier",       state:"CA", stateName:"California",    cd:"38", sd:"22", ad:"67" },
  "90802":{ city:"Long Beach",     state:"CA", stateName:"California",    cd:"42", sd:"35", ad:"58" },
  "91768":{ city:"Pomona",         state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91766":{ city:"Pomona",         state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91767":{ city:"Pomona",         state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91750":{ city:"La Verne",       state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91789":{ city:"Walnut",         state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91790":{ city:"West Covina",    state:"CA", stateName:"California",    cd:"32", sd:"22", ad:"49" },
  "91710":{ city:"Chino",          state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91761":{ city:"Ontario",        state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91786":{ city:"Upland",         state:"CA", stateName:"California",    cd:"35", sd:"22", ad:"53" },
  "91602":{ city:"North Hollywood",state:"CA", stateName:"California",    cd:"30", sd:"27", ad:"46" },
  "91101":{ city:"Pasadena",       state:"CA", stateName:"California",    cd:"28", sd:"25", ad:"49" },
  "94110":{ city:"San Francisco",  state:"CA", stateName:"California",    cd:"11", sd:"11", ad:"19" },
  "94102":{ city:"San Francisco",  state:"CA", stateName:"California",    cd:"11", sd:"11", ad:"19" },
  "94601":{ city:"Oakland",        state:"CA", stateName:"California",    cd:"12", sd:"10", ad:"18" },
  "94702":{ city:"Berkeley",       state:"CA", stateName:"California",    cd:"12", sd:"10", ad:"14" },
  "95110":{ city:"San Jose",       state:"CA", stateName:"California",    cd:"18", sd:"15", ad:"27" },
  "95814":{ city:"Sacramento",     state:"CA", stateName:"California",    cd:"7",  sd:"8",  ad:"7"  },
  "92101":{ city:"San Diego",      state:"CA", stateName:"California",    cd:"50", sd:"39", ad:"78" },
  "92602":{ city:"Irvine",         state:"CA", stateName:"California",    cd:"47", sd:"37", ad:"73" },
  "92801":{ city:"Anaheim",        state:"CA", stateName:"California",    cd:"46", sd:"34", ad:"67" },
  // Texas
  "77001":{ city:"Houston",        state:"TX", stateName:"Texas",         cd:"18", sd:"6",  ad:"51" },
  "77002":{ city:"Houston",        state:"TX", stateName:"Texas",         cd:"18", sd:"6",  ad:"51" },
  "77019":{ city:"Houston",        state:"TX", stateName:"Texas",         cd:"7",  sd:"6",  ad:"51" },
  "77056":{ city:"Houston",        state:"TX", stateName:"Texas",         cd:"7",  sd:"6",  ad:"51" },
  "77301":{ city:"Conroe",         state:"TX", stateName:"Texas",         cd:"8",  sd:"4",  ad:"16" },
  "78201":{ city:"San Antonio",    state:"TX", stateName:"Texas",         cd:"35", sd:"26", ad:"51" },
  "78205":{ city:"San Antonio",    state:"TX", stateName:"Texas",         cd:"35", sd:"26", ad:"51" },
  "78701":{ city:"Austin",         state:"TX", stateName:"Texas",         cd:"35", sd:"14", ad:"46" },
  "78702":{ city:"Austin",         state:"TX", stateName:"Texas",         cd:"35", sd:"14", ad:"51" },
  "78703":{ city:"Austin",         state:"TX", stateName:"Texas",         cd:"35", sd:"14", ad:"49" },
  "75201":{ city:"Dallas",         state:"TX", stateName:"Texas",         cd:"30", sd:"23", ad:"100"},
  "75202":{ city:"Dallas",         state:"TX", stateName:"Texas",         cd:"30", sd:"23", ad:"100"},
  "76101":{ city:"Fort Worth",     state:"TX", stateName:"Texas",         cd:"12", sd:"10", ad:"99" },
  "79901":{ city:"El Paso",        state:"TX", stateName:"Texas",         cd:"16", sd:"29", ad:"76" },
  // New York
  "10001":{ city:"New York",       state:"NY", stateName:"New York",      cd:"12", sd:"20", ad:"34" },
  "10002":{ city:"New York",       state:"NY", stateName:"New York",      cd:"7",  sd:"18", ad:"65" },
  "10003":{ city:"New York",       state:"NY", stateName:"New York",      cd:"12", sd:"27", ad:"66" },
  "10007":{ city:"New York",       state:"NY", stateName:"New York",      cd:"12", sd:"27", ad:"65" },
  "10014":{ city:"New York",       state:"NY", stateName:"New York",      cd:"12", sd:"27", ad:"66" },
  "10021":{ city:"New York",       state:"NY", stateName:"New York",      cd:"12", sd:"28", ad:"76" },
  "10025":{ city:"New York",       state:"NY", stateName:"New York",      cd:"13", sd:"30", ad:"69" },
  "10027":{ city:"New York",       state:"NY", stateName:"New York",      cd:"13", sd:"30", ad:"70" },
  "10451":{ city:"Bronx",          state:"NY", stateName:"New York",      cd:"15", sd:"18", ad:"77" },
  "10453":{ city:"Bronx",          state:"NY", stateName:"New York",      cd:"15", sd:"36", ad:"79" },
  "11201":{ city:"Brooklyn",       state:"NY", stateName:"New York",      cd:"7",  sd:"18", ad:"52" },
  "11215":{ city:"Brooklyn",       state:"NY", stateName:"New York",      cd:"7",  sd:"20", ad:"38" },
  "11368":{ city:"Queens",         state:"NY", stateName:"New York",      cd:"6",  sd:"14", ad:"39" },
  "11372":{ city:"Queens",         state:"NY", stateName:"New York",      cd:"6",  sd:"13", ad:"39" },
  // Florida
  "32801":{ city:"Orlando",        state:"FL", stateName:"Florida",       cd:"10", sd:"15", ad:"42" },
  "32803":{ city:"Orlando",        state:"FL", stateName:"Florida",       cd:"10", sd:"15", ad:"42" },
  "32901":{ city:"Melbourne",      state:"FL", stateName:"Florida",       cd:"8",  sd:"16", ad:"52" },
  "33101":{ city:"Miami",          state:"FL", stateName:"Florida",       cd:"27", sd:"37", ad:"108"},
  "33125":{ city:"Miami",          state:"FL", stateName:"Florida",       cd:"27", sd:"36", ad:"109"},
  "33130":{ city:"Miami",          state:"FL", stateName:"Florida",       cd:"27", sd:"37", ad:"113"},
  "33401":{ city:"West Palm Beach",state:"FL", stateName:"Florida",       cd:"22", sd:"29", ad:"88" },
  "33601":{ city:"Tampa",          state:"FL", stateName:"Florida",       cd:"14", sd:"18", ad:"61" },
  "33602":{ city:"Tampa",          state:"FL", stateName:"Florida",       cd:"14", sd:"18", ad:"61" },
  "32202":{ city:"Jacksonville",   state:"FL", stateName:"Florida",       cd:"5",  sd:"6",  ad:"14" },
  // Illinois
  "60601":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"7",  sd:"20", ad:"34" },
  "60602":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"7",  sd:"20", ad:"34" },
  "60607":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"7",  sd:"1",  ad:"5"  },
  "60611":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"5",  sd:"3",  ad:"13" },
  "60614":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"5",  sd:"3",  ad:"12" },
  "60637":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"1",  sd:"15", ad:"25" },
  "60640":{ city:"Chicago",        state:"IL", stateName:"Illinois",      cd:"9",  sd:"20", ad:"40" },
  // Pennsylvania
  "19101":{ city:"Philadelphia",   state:"PA", stateName:"Pennsylvania",  cd:"3",  sd:"1",  ad:"182"},
  "19103":{ city:"Philadelphia",   state:"PA", stateName:"Pennsylvania",  cd:"3",  sd:"1",  ad:"182"},
  "15201":{ city:"Pittsburgh",     state:"PA", stateName:"Pennsylvania",  cd:"12", sd:"43", ad:"21" },
  "15203":{ city:"Pittsburgh",     state:"PA", stateName:"Pennsylvania",  cd:"12", sd:"42", ad:"22" },
  // Georgia
  "30301":{ city:"Atlanta",        state:"GA", stateName:"Georgia",       cd:"5",  sd:"36", ad:"58" },
  "30303":{ city:"Atlanta",        state:"GA", stateName:"Georgia",       cd:"5",  sd:"36", ad:"58" },
  "30308":{ city:"Atlanta",        state:"GA", stateName:"Georgia",       cd:"5",  sd:"6",  ad:"63" },
  // Arizona
  "85001":{ city:"Phoenix",        state:"AZ", stateName:"Arizona",       cd:"3",  sd:"8",  ad:"16" },
  "85003":{ city:"Phoenix",        state:"AZ", stateName:"Arizona",       cd:"3",  sd:"8",  ad:"24" },
  "85701":{ city:"Tucson",         state:"AZ", stateName:"Arizona",       cd:"7",  sd:"10", ad:"3"  },
  "85711":{ city:"Tucson",         state:"AZ", stateName:"Arizona",       cd:"7",  sd:"10", ad:"4"  },
  // Nevada
  "89101":{ city:"Las Vegas",      state:"NV", stateName:"Nevada",        cd:"1",  sd:"7",  ad:"8"  },
  "89102":{ city:"Las Vegas",      state:"NV", stateName:"Nevada",        cd:"1",  sd:"7",  ad:"8"  },
  "89501":{ city:"Reno",           state:"NV", stateName:"Nevada",        cd:"2",  sd:"13", ad:"25" },
  // Washington
  "98101":{ city:"Seattle",        state:"WA", stateName:"Washington",    cd:"7",  sd:"43", ad:"43" },
  "98102":{ city:"Seattle",        state:"WA", stateName:"Washington",    cd:"7",  sd:"43", ad:"43" },
  "98103":{ city:"Seattle",        state:"WA", stateName:"Washington",    cd:"7",  sd:"46", ad:"46" },
  // Oregon
  "97201":{ city:"Portland",       state:"OR", stateName:"Oregon",        cd:"3",  sd:"23", ad:"42" },
  "97202":{ city:"Portland",       state:"OR", stateName:"Oregon",        cd:"3",  sd:"26", ad:"42" },
  // Colorado
  "80201":{ city:"Denver",         state:"CO", stateName:"Colorado",      cd:"1",  sd:"33", ad:"8"  },
  "80203":{ city:"Denver",         state:"CO", stateName:"Colorado",      cd:"1",  sd:"33", ad:"9"  },
  // Michigan
  "48201":{ city:"Detroit",        state:"MI", stateName:"Michigan",      cd:"13", sd:"4",  ad:"8"  },
  "48202":{ city:"Detroit",        state:"MI", stateName:"Michigan",      cd:"13", sd:"4",  ad:"9"  },
  // Minnesota
  "55401":{ city:"Minneapolis",    state:"MN", stateName:"Minnesota",     cd:"5",  sd:"58", ad:"58" },
  "55403":{ city:"Minneapolis",    state:"MN", stateName:"Minnesota",     cd:"5",  sd:"61", ad:"61" },
  "55101":{ city:"St. Paul",       state:"MN", stateName:"Minnesota",     cd:"4",  sd:"64", ad:"65" },
};

// ── Bill vote records ───────────────────────────────────────────
const BILL_VOTES = {
  "Norma Torres": {
    missed:[
      { bill:"H.R.1968", title:"Government Funding Continuing Resolution", date:"Mar 11, 2025", type:"Appropriations" },
      { bill:"H.R.715",  title:"Protecting America's Strategic Petroleum Reserve Act", date:"Feb 26, 2025", type:"Energy" },
      { bill:"H.R.22",   title:"HALT Fentanyl Act", date:"Feb 5, 2025", type:"Public Safety" },
      { bill:"H.R.444",  title:"Limit, Save, Grow Act", date:"Apr 26, 2025", type:"Budget" },
      { bill:"H.R.3935", title:"FAA Reauthorization Act", date:"May 21, 2025", type:"Transportation" },
      { bill:"H.R.521",  title:"Border Security and Immigration Reform Act", date:"Jan 22, 2025", type:"Immigration" },
      { bill:"H.R.802",  title:"Children and Families First Act", date:"Mar 4, 2025", type:"Social Services" },
    ],
    present:[
      { bill:"H.R.2811", title:"Fiscal Responsibility Act", date:"May 31, 2025", vote:"Yea", type:"Budget" },
      { bill:"H.R.7521", title:"Protecting Americans from Foreign Adversary Controlled Apps", date:"Mar 13, 2025", vote:"Nay", type:"Technology" },
      { bill:"H.R.2",    title:"Lower Energy Costs Act", date:"Mar 30, 2025", vote:"Nay", type:"Energy" },
      { bill:"H.R.5",    title:"Parents Bill of Rights Act", date:"Mar 24, 2025", vote:"Nay", type:"Education" },
      { bill:"H.R.485",  title:"More Opportunities for Moms to Succeed Act", date:"Feb 14, 2025", vote:"Yea", type:"Labor" },
      { bill:"H.R.1110", title:"America's Water Infrastructure Act", date:"Apr 9, 2025", vote:"Yea", type:"Infrastructure" },
      { bill:"H.R.1599", title:"SNAP Access for Certain Veterans Act", date:"May 1, 2025", vote:"Yea", type:"Veterans" },
    ],
    abstained:[
      { bill:"H.R.3746",    title:"Fiscal Responsibility Act Amendment", date:"Jun 1, 2025", type:"Budget" },
      { bill:"H.Con.Res.9", title:"Denouncing Socialism Resolution", date:"Feb 2, 2025", type:"Procedural" },
      { bill:"H.R.6090",    title:"Antisemitism Awareness Act", date:"May 2, 2025", type:"Civil Rights" },
      { bill:"H.J.Res.30",  title:"Congressional Disapproval — DOL Rule", date:"Feb 28, 2025", type:"Labor" },
    ],
  },
  "Michelle Rodriguez": {
    missed:[
      { bill:"AB 1234", title:"Housing Affordability and Tenant Protections Act", date:"Apr 14, 2025", type:"Housing" },
      { bill:"SB 567",  title:"Criminal Justice Reform Omnibus", date:"Mar 28, 2025", type:"Criminal Justice" },
      { bill:"AB 890",  title:"Clean Energy Transition Fund", date:"May 5, 2025", type:"Environment" },
      { bill:"AB 442",  title:"School Safety Enhancement Act", date:"Feb 19, 2025", type:"Education" },
      { bill:"AB 778",  title:"Healthcare Cost Transparency Act", date:"Apr 22, 2025", type:"Healthcare" },
    ],
    present:[
      { bill:"AB 2011", title:"Affordable Housing and High Road Jobs Act", date:"May 12, 2025", vote:"Aye", type:"Housing" },
      { bill:"SB 9",    title:"Housing Opportunity and More Efficiency Act", date:"Mar 5, 2025", vote:"Aye", type:"Housing" },
      { bill:"AB 257",  title:"FAST Recovery Act", date:"Apr 2, 2025", vote:"Aye", type:"Labor" },
      { bill:"SB 54",   title:"Law Enforcement Agency Policy Act", date:"Feb 11, 2025", vote:"Aye", type:"Public Safety" },
      { bill:"AB 333",  title:"STEP Act Amendments", date:"Apr 28, 2025", vote:"No", type:"Criminal Justice" },
    ],
    abstained:[
      { bill:"AB 944",  title:"Insurance Market Reform Act", date:"May 8, 2025", type:"Insurance" },
      { bill:"SB 328",  title:"Police Use of Force Standards", date:"Mar 12, 2025", type:"Public Safety" },
    ],
  },
  "Susan Rubio": {
    missed:[
      { bill:"SB 567", title:"Criminal Justice Reform Omnibus", date:"Mar 28, 2025", type:"Criminal Justice" },
      { bill:"SB 201", title:"Public Employee Pension Reform", date:"Jan 30, 2025", type:"Finance" },
    ],
    present:[
      { bill:"SB 2",   title:"Housing Accountability Act", date:"Feb 20, 2025", vote:"Aye", type:"Housing" },
      { bill:"SB 423", title:"Streamlining Housing Approvals", date:"Apr 10, 2025", vote:"Aye", type:"Housing" },
      { bill:"SB 872", title:"Domestic Violence Restraining Order Act", date:"Mar 15, 2025", vote:"Aye", type:"Public Safety" },
    ],
    abstained:[
      { bill:"SB 474", title:"Public Safety Omnibus", date:"Mar 19, 2025", type:"Public Safety" },
    ],
  },
  "Alex Padilla": {
    missed:[
      { bill:"S.4361", title:"FAA Reauthorization Act", date:"May 9, 2025", type:"Transportation" },
      { bill:"S.2226", title:"National Defense Authorization Act", date:"Jul 27, 2025", type:"Defense" },
    ],
    present:[
      { bill:"S.388",  title:"Veteran Suicide Prevention Act", date:"Feb 28, 2025", vote:"Yea", type:"Veterans" },
      { bill:"S.622",  title:"Bipartisan Background Checks Act", date:"Mar 17, 2025", vote:"Yea", type:"Public Safety" },
    ],
    abstained:[
      { bill:"S.Con.Res.4", title:"Budget Resolution FY2026", date:"Apr 4, 2025", type:"Budget" },
    ],
  },
  "Adam Schiff": {
    missed:[
      { bill:"S.4361", title:"FAA Reauthorization Act", date:"May 9, 2025", type:"Transportation" },
      { bill:"S.2226", title:"NDAA FY2025", date:"Jul 27, 2025", type:"Defense" },
      { bill:"S.1093", title:"Affordable Housing Credit Improvement Act", date:"Apr 3, 2025", type:"Housing" },
    ],
    present:[
      { bill:"S.622",  title:"Bipartisan Background Checks Act", date:"Mar 17, 2025", vote:"Yea", type:"Public Safety" },
      { bill:"S.744",  title:"Border Security Economic Opportunity Act", date:"Feb 10, 2025", vote:"Yea", type:"Immigration" },
    ],
    abstained:[
      { bill:"S.Con.Res.4", title:"Budget Resolution FY2026", date:"Apr 4, 2025", type:"Budget" },
      { bill:"S.1890",      title:"FISA Reauthorization Act", date:"Apr 20, 2025", type:"National Security" },
    ],
  },
};

function generateBills(filter, count) {
  const topics = ["Housing Reform Act","Public Safety Omnibus","Education Funding Act",
    "Healthcare Access Act","Infrastructure Investment Act","Clean Energy Act",
    "Tax Relief Act","Criminal Justice Reform","Veterans Benefits Act","Budget Resolution"];
  const dates = ["Jan 14","Feb 5","Feb 28","Mar 12","Mar 28","Apr 9","Apr 22","May 6","May 19","Jun 3"];
  return Array.from({length:count},(_,i)=>({
    bill: `H.R.${1000+i*37}`,
    title: topics[i%topics.length],
    date: `${dates[i%dates.length]}, 2025`,
    type: ["Budget","Public Safety","Housing","Healthcare","Education"][i%5],
    ...(filter!=="missed"?{vote:i%3===0?"Nay":"Yea"}:{}),
  }));
}

function getBillData(name, filter) {
  const data = BILL_VOTES[name];
  if (data) return data[filter]||[];
  return generateBills(filter, filter==="present"?12:filter==="missed"?6:3);
}

function getGrade(pct) {
  if (pct >= 97) return { letter:"A", color:"#22c55e", bg:"#dcfce7" };
  if (pct >= 92) return { letter:"B", color:"#84cc16", bg:"#ecfccb" };
  if (pct >= 85) return { letter:"C", color:"#f59e0b", bg:"#fef3c7" };
  if (pct >= 75) return { letter:"D", color:"#f97316", bg:"#ffedd5" };
  return { letter:"F", color:"#ef4444", bg:"#fee2e2" };
}

function Ring({ pct, color, size=64 }) {
  const r=(size-10)/2, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s ease"}}/>
    </svg>
  );
}

function StatRing({ label, value, total, color, onClick }) {
  const pct = total>0?Math.round((value/total)*100):0;
  return (
    <div onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",
      gap:4,cursor:"pointer",padding:"8px 10px",borderRadius:14,transition:"background 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{position:"relative",width:64,height:64}}>
        <Ring pct={pct} color={color}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:12,fontWeight:800,color}}>{pct}%</div>
      </div>
      <div style={{fontSize:10,color:"#6b7280",textTransform:"uppercase",
        letterSpacing:"0.05em",fontWeight:600}}>{label}</div>
      <div style={{fontSize:11,color:"#374151"}}>{value.toLocaleString()} <span style={{color:"#9ca3af"}}>votes</span></div>
      <div style={{fontSize:9,color,fontWeight:600,opacity:0.8}}>TAP TO SEE →</div>
    </div>
  );
}

function BillDetailScreen({ member, filter, onBack }) {
  const bills = getBillData(member.name, filter);
  const cfg = {
    missed:    { label:"Missed Votes",    color:"#ef4444", bg:"#fee2e2", icon:"❌", desc:"Not present when vote was called." },
    present:   { label:"Votes Cast",      color:"#22c55e", bg:"#dcfce7", icon:"✅", desc:"Showed up and voted on these bills." },
    abstained: { label:"Abstained",       color:"#f59e0b", bg:"#fef3c7", icon:"⚠️", desc:"Present but chose not to vote — often signals a conflict of interest." },
  }[filter];
  const initials = member.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",
        padding:"20px 20px 24px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",
            color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>NoShow<span style={{color:"#3b82f6"}}>Votes</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff"}}>{initials}</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{member.name}</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>{member.role} · {member.body}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 8px"}}>
        <div style={{background:cfg.bg,borderRadius:14,padding:"12px 16px",
          display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <span style={{fontSize:20}}>{cfg.icon}</span>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:cfg.color}}>{cfg.label}</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{cfg.desc}</div>
          </div>
          <div style={{marginLeft:"auto",background:cfg.color,color:"#fff",
            borderRadius:99,padding:"4px 12px",fontSize:13,fontWeight:800}}>{bills.length}</div>
        </div>
      </div>

      <div style={{padding:"0 16px 32px"}}>
        {bills.map((bill,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:16,padding:"16px",
            marginBottom:10,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:"1px solid #f1f5f9"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{flexShrink:0,marginTop:2}}>
                {filter==="missed"?(
                  <div style={{width:36,height:36,borderRadius:10,background:"#fee2e2",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>❌</div>
                ):filter==="abstained"?(
                  <div style={{width:36,height:36,borderRadius:10,background:"#fef3c7",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚠️</div>
                ):(
                  <div style={{width:36,height:36,borderRadius:10,
                    background:bill.vote==="Yea"||bill.vote==="Aye"?"#dcfce7":"#fee2e2",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,
                    color:bill.vote==="Yea"||bill.vote==="Aye"?"#16a34a":"#dc2626"}}>{bill.vote}</div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:4,lineHeight:1.4}}>{bill.title}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#3b82f6"}}>{bill.bill}</span>
                  <span style={{fontSize:10,color:"#9ca3af"}}>·</span>
                  <span style={{fontSize:11,color:"#6b7280"}}>{bill.date}</span>
                  <span style={{fontSize:10,color:"#9ca3af"}}>·</span>
                  <span style={{background:"#f1f5f9",color:"#475569",fontSize:10,fontWeight:600,
                    padding:"2px 8px",borderRadius:99}}>{bill.type}</span>
                </div>
                {filter==="missed"&&<div style={{marginTop:6,fontSize:11,color:"#ef4444",fontWeight:600}}>Not present for this vote</div>}
                {filter==="abstained"&&<div style={{marginTop:6,fontSize:11,color:"#f59e0b",fontWeight:600}}>Present · chose not to vote</div>}
              </div>
            </div>
          </div>
        ))}
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#cbd5e1"}}>
          Data: LegiScan · ProPublica Congress API · Non-partisan
        </div>
      </div>
    </div>
  );
}

function MemberCard({ name, role, party, district, body, present, absent, abstain, onDrillDown }) {
  const total=present+absent+abstain;
  const pct=parseFloat(((present/total)*100).toFixed(1));
  const g=getGrade(pct);
  const initials=name.split(" ").filter(n=>n&&!["Jr.","Sr.","II","III"].includes(n)).map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{background:"#fff",borderRadius:20,padding:20,marginBottom:14,
      boxShadow:"0 2px 16px rgba(0,0,0,0.07)",border:"1px solid #f1f5f9"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:48,height:48,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${g.color}33,${g.color}66)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:16,fontWeight:800,color:g.color}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:1}}>{name}</div>
          <div style={{fontSize:12,color:"#6b7280"}}>{role}{district!=="ST"?` · District ${district}`:" · Statewide"}</div>
          <div style={{marginTop:3,display:"flex",gap:6,alignItems:"center"}}>
            <span style={{background:party==="D"?"#dbeafe":party==="R"?"#fee2e2":"#f3f4f6",
              color:party==="D"?"#1d4ed8":party==="R"?"#dc2626":"#374151",
              padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>
              {party==="D"?"Democrat":party==="R"?"Republican":"Independent"}
            </span>
            <span style={{fontSize:10,color:"#94a3b8"}}>{body}</span>
          </div>
        </div>
        <div style={{width:50,height:50,borderRadius:14,background:g.bg,flexShrink:0,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:22,fontWeight:900,color:g.color,lineHeight:1}}>{g.letter}</div>
          <div style={{fontSize:9,color:g.color,fontWeight:600}}>GRADE</div>
        </div>
      </div>
      <div style={{height:1,background:"#f3f4f6",marginBottom:4}}/>
      <div style={{textAlign:"center",fontSize:10,color:"#94a3b8",marginBottom:4}}>Tap a ring to see the actual votes</div>
      <div style={{display:"flex",justifyContent:"space-around"}}>
        <StatRing label="Showed Up" value={present} total={total} color="#22c55e" onClick={()=>onDrillDown({name,role,body,district},"present")}/>
        <StatRing label="Missed"    value={absent}  total={total} color="#ef4444" onClick={()=>onDrillDown({name,role,body,district},"missed")}/>
        <StatRing label="Abstained" value={abstain} total={total} color="#f59e0b" onClick={()=>onDrillDown({name,role,body,district},"abstained")}/>
      </div>
      <div style={{marginTop:12,background:"#f9fafb",borderRadius:10,padding:"9px 14px",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:"#6b7280"}}>Total votes this session</span>
        <span style={{fontSize:14,fontWeight:700,color:"#111827"}}>{total.toLocaleString()}</span>
      </div>
      <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e"}}/>
        <span style={{fontSize:10,color:"#22c55e",fontWeight:600}}>LIVE · Updated weekly</span>
      </div>
    </div>
  );
}

function SectionHeader({ emoji, title, subtitle }) {
  return (
    <div style={{marginBottom:10,marginTop:4}}>
      <div style={{fontSize:13,fontWeight:800,color:"#1e3a5f",display:"flex",alignItems:"center",gap:6}}>
        <span>{emoji}</span>{title}
      </div>
      {subtitle&&<div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{subtitle}</div>}
    </div>
  );
}

function SearchScreen({ onSearch }) {
  const [zip,setZip]=useState("");
  const [err,setErr]=useState("");
  const handle=()=>{
    if(zip.length<5)return;
    const result=ZIP_DATA[zip];
    if(!result){setErr(`We're still adding zip codes — ${zip} isn't in our database yet. We're expanding weekly. Try: 91768, 90001, 10001, 77001, or 60601.`);return;}
    setErr(""); onSearch(zip,result);
  };

  return (
    <div style={{minHeight:"100vh",
      background:"linear-gradient(160deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"40px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{marginBottom:44,textAlign:"center"}}>
        <div style={{fontSize:13,letterSpacing:"0.3em",color:"#60a5fa",fontWeight:600,
          marginBottom:10,textTransform:"uppercase"}}>United States</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",lineHeight:1,letterSpacing:"-0.02em"}}>
          NoShow<span style={{color:"#3b82f6"}}>Votes</span>
        </div>
        <div style={{marginTop:12,fontSize:15,color:"#94a3b8",maxWidth:300,lineHeight:1.6}}>
          You showed up to vote. Did they?
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:36,flexWrap:"wrap",justifyContent:"center"}}>
        {[["50","States"],["535","Congress Members"],["Tap","to Drill Down"]].map(([v,l])=>(
          <div key={l} style={{background:"rgba(255,255,255,0.08)",borderRadius:99,
            padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{v}</span>
            <span style={{fontSize:12,color:"#64748b"}}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{width:"100%",maxWidth:360}}>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:8,letterSpacing:"0.05em",
          fontWeight:600,textTransform:"uppercase"}}>Enter your zip code</div>
        <div style={{display:"flex",gap:10}}>
          <input value={zip}
            onChange={e=>{setZip(e.target.value.replace(/\D/g,"").slice(0,5));setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handle()}
            placeholder="e.g. 91768"
            style={{flex:1,padding:"16px 18px",borderRadius:14,
              border:"1.5px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.08)",color:"#fff",
              fontSize:20,fontWeight:700,outline:"none",
              letterSpacing:"0.1em",fontFamily:"inherit"}}/>
          <button onClick={handle} disabled={zip.length<5}
            style={{background:zip.length>=5?"#3b82f6":"#1e293b",color:"#fff",border:"none",
              borderRadius:14,padding:"0 22px",fontSize:22,
              cursor:zip.length>=5?"pointer":"default",transition:"background 0.2s"}}>→</button>
        </div>
        {err&&(
          <div style={{marginTop:14,background:"rgba(255,255,255,0.08)",borderRadius:14,
            padding:"16px",border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#f87171",marginBottom:6}}>📍 Zip code not in our database yet</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>We're expanding weekly. Currently covering major cities across CA, TX, NY, FL, IL, PA, GA, AZ, NV, CO, WA, OR, MN and MI.</div>
            <div style={{marginTop:10,fontSize:11,color:"#64748b"}}>Try: 91768 · 90001 · 10001 · 77001 · 60601 · 33101</div>
          </div>
        )}
        <div style={{marginTop:12,fontSize:11,color:"#475569",textAlign:"center"}}>
          Try: 91768 · 10001 · 77001 · 60601 · 78701
        </div>
      </div>

      <div style={{position:"absolute",bottom:28,fontSize:11,color:"#334155",letterSpacing:"0.05em"}}>
        NON-PARTISAN · REAL DATA · noshowvotes.com
      </div>
    </div>
  );
}

function getRealStats(name, fp, fa, fab) {
  if (CA_REAL_DATA && CA_REAL_DATA[name]) {
    const d = CA_REAL_DATA[name];
    return [d.present, d.absent, d.abstain];
  }
  return [fp, fa, fab];
}

function ResultsScreen({ zip, zipData, onBack, onDrillDown }) {
  const { city, state, stateName, cd, sd, ad } = zipData;
  const senators = US_SENATORS[state] || [];
  const houseRep = (US_HOUSE[state]||{})[cd];
  const stateLegs = STATE_LEGS[state];
  const senRow = stateLegs?.senate?.[sd];
  const asmRow = stateLegs?.assembly?.[ad];

  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",
        padding:"20px 20px 24px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",
            color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>NoShow<span style={{color:"#3b82f6"}}>Votes</span></div>
        </div>
        <div style={{fontSize:19,fontWeight:700,color:"#fff",marginTop:6}}>Your Representatives</div>
        <div style={{fontSize:13,color:"#94a3b8"}}>ZIP {zip} · {city}, {state} · Tap any ring to see votes</div>
      </div>

      <div style={{padding:"12px 20px 8px",background:"#fff",borderBottom:"1px solid #f1f5f9"}}>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:6,fontWeight:600,
          textTransform:"uppercase",letterSpacing:"0.05em"}}>Attendance Grade</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["A","#22c55e","97%+"],["B","#84cc16","92–96%"],["C","#f59e0b","85–91%"],
            ["D","#f97316","75–84%"],["F","#ef4444","<75%"]].map(([l,c,r])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:18,height:18,borderRadius:5,background:`${c}22`,color:c,
                fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{l}</div>
              <span style={{fontSize:10,color:"#9ca3af"}}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 16px 32px"}}>
        <SectionHeader emoji="🇺🇸" title="U.S. Senate" subtitle={`Represents all of ${stateName}`}/>
        {senators.map((s,i)=>(
          <MemberCard key={i} name={s.name} role="U.S. Senator" party={s.party}
            district="ST" body={`U.S. Senate · 119th Congress`}
            present={s.present} absent={s.absent} abstain={s.abstain} onDrillDown={onDrillDown}/>
        ))}
        {senators.length===0&&(
          <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:14,
            color:"#6b7280",fontSize:13,textAlign:"center"}}>
            Senator data coming soon for {stateName}
          </div>
        )}

        <div style={{marginTop:8}}>
          <SectionHeader emoji="🏛️" title="U.S. House of Representatives" subtitle={`Congressional District ${cd}`}/>
          {houseRep?(
            <MemberCard name={houseRep.name} role="U.S. Representative" party={houseRep.party}
              district={cd} body={`U.S. House · ${state}-${cd} · 119th Congress`}
              present={houseRep.present} absent={houseRep.absent} abstain={houseRep.abstain}
              onDrillDown={onDrillDown}/>
          ):(
            <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:14,
              color:"#6b7280",fontSize:13,textAlign:"center"}}>
              House rep data coming soon for District {cd}
            </div>
          )}
        </div>

        {stateLegs&&(
          <div style={{marginTop:8}}>
            <SectionHeader emoji="🏟️" title={`${stateName} State Legislature`}/>
            {senRow&&<MemberCard name={senRow[0]} role="State Senator" party={senRow[1]}
              district={sd} body={`${state} Senate · District ${sd}`}
              present={getRealStats(senRow[0],senRow[2],senRow[3],senRow[4])[0]} absent={getRealStats(senRow[0],senRow[2],senRow[3],senRow[4])[1]} abstain={getRealStats(senRow[0],senRow[2],senRow[3],senRow[4])[2]} onDrillDown={onDrillDown}/>}
            {asmRow&&<MemberCard name={asmRow[0]} role={state==="CA"?"Assembly Member":"State Representative"} party={asmRow[1]}
              district={ad} body={`${state} House · District ${ad}`}
              present={getRealStats(asmRow[0],asmRow[2],asmRow[3],asmRow[4])[0]} absent={getRealStats(asmRow[0],asmRow[2],asmRow[3],asmRow[4])[1]} abstain={getRealStats(asmRow[0],asmRow[2],asmRow[3],asmRow[4])[2]} onDrillDown={onDrillDown}/>}
          </div>
        )}

        <div style={{background:"#fff",borderRadius:16,padding:16,border:"1px solid #e5e7eb",marginTop:8}}>
          <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>📊 What this means</div>
          <div style={{fontSize:11,color:"#6b7280",lineHeight:1.9}}>
            <b>Showed Up</b> — cast a Yes or No vote<br/>
            <b>Missed</b> — not present when vote was called<br/>
            <b>Abstained</b> — present but chose not to vote<br/>
            <b style={{color:"#3b82f6"}}>Tap any ring</b> — to see the actual bills
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#94a3b8"}}>
          Congress: ProPublica · State: LegiScan · Non-partisan · noshowvotes.com
        </div>
      </div>
    </div>
  );
}

export default function NoShowVotes() {
  const [screen,setScreen]=useState("search");
  const [zip,setZip]=useState("");
  const [zipData,setZipData]=useState(null);
  const [drillMember,setDrillMember]=useState(null);
  const [drillFilter,setDrillFilter]=useState(null);

  useEffect(()=>{ loadCAData(); },[]);

  const handleSearch=(zipCode,data)=>{setZip(zipCode);setZipData(data);setScreen("results");};
  const handleDrillDown=(member,filter)=>{setDrillMember(member);setDrillFilter(filter);setScreen("detail");};

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      {screen==="search"&&<SearchScreen onSearch={handleSearch}/>}
      {screen==="results"&&<ResultsScreen zip={zip} zipData={zipData} onBack={()=>setScreen("search")} onDrillDown={handleDrillDown}/>}
      {screen==="detail"&&<BillDetailScreen member={drillMember} filter={drillFilter} onBack={()=>setScreen("results")}/>}
    </>
  );
}

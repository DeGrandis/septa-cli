/**
 * SEPTA Regional Rail API Tool
 * Pure JavaScript - ZERO dependencies (only needs `fetch`)
 * Designed to be used directly by an LLM as a tool, and also as a CLI.
 *
 * Station names MUST be exact (including spaces and capitalization).
 * Full list: https://www3.septa.org/VIRegionalRail.html
 *
 * Common examples:
 *   "Suburban Station", "30th Street Station", "Jefferson Station" (or "Market East"),
 *   "Airport Terminal A", "Norristown TC", "Temple U", "Doylestown", "Wilmington", etc.
 */

const BASE_URL = "https://www3.septa.org/api";

/**
 * Get next departures FROM a station (all directions, with destinations, times, track, status)
 * @param {string} station - exact station name, e.g. "Suburban Station"
 * @param {number} results - how many trains to return (default 10)
 * @returns {Promise<Object>} structured departures by direction
 */
async function getNextDepartures(station, results = 10) {
  const url = `${BASE_URL}/Arrivals/index.php?station=${encodeURIComponent(station)}&results=${results}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SEPTA API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();

  // The response has one dynamic key like "Suburban Station Departures: February 12, 2026, 11:02 pm"
  const titleKey = Object.keys(raw)[0];
  const data = raw[titleKey][0] || { Northbound: [], Southbound: [] };

  return {
    station,
    timestamp: titleKey,
    northbound: data.Northbound || [],
    southbound: data.Southbound || []
  };
}

/**
 * Get the next trains that go FROM station X TO station Y
 * Returns scheduled departure from X and arrival at Y (only direct trains)
 * @param {string} fromStation - exact origin station name
 * @param {string} toStation - exact destination station name
 * @param {number} numResults - how many trains to return (default 5)
 * @returns {Promise<Object>} array of trains with departure/arrival times
 */
async function getNextToArrive(fromStation, toStation, numResults = 5) {
  const url = `${BASE_URL}/NextToArrive/index.php?req1=${encodeURIComponent(fromStation)}&req2=${encodeURIComponent(toStation)}&req3=${numResults}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SEPTA API error: ${response.status} ${response.statusText}`);
  }

  const trains = await response.json();

  return {
    from: fromStation,
    to: toStation,
    trains: trains
  };
}

// --- CLI Logic ---

async function main() {
  const args = process.argv.slice(2); // Remove 'node' and script path

  if (args.length < 2) {
    console.error("Usage:");
    console.error("  node septa.js departures <station> [results]");
    console.error("  node septa.js to <fromStation> <toStation> [results]");
    process.exit(1);
  }

  const command = args[0];
  let results = 10;

  try {
    if (command === "departures") {
      const station = args[1];
      if (args.length > 2) {
        results = parseInt(args[2], 10);
        if (isNaN(results)) {
          throw new Error("Invalid number for results.");
        }
      }
      const data = await getNextDepartures(station, results);
      console.log(JSON.stringify(data, null, 2));
    } else if (command === "to") {
      const fromStation = args[1];
      const toStation = args[2];
      if (args.length > 3) {
        results = parseInt(args[3], 10);
        if (isNaN(results)) {
          throw new Error("Invalid number for results.");
        }
      }
      const data = await getNextToArrive(fromStation, toStation, results);
      console.log(JSON.stringify(data, null, 2));
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Execute main function if the script is run directly
if (require.main === module) {
  main();
}

/* ================================================
   LLM Tool Usage:
   ================================================ */

// To use in LLM:
// await getNextDepartures("Suburban Station", 8)
// await getNextToArrive("30th Street Station", "Airport Terminal A", 3)

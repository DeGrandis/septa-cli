<div align="center">
  <img src="images/septa-logo.png" alt="SEPTA Logo" width="400">
</div>

# 🚆 SEPTA Regional Rail CLI

Command-line tool for accessing real-time SEPTA Regional Rail train schedules, departures, delays, and live train tracking in the Philadelphia area.

## � Quick Install

```bash
npx skills add DeGrandis/septa-cli
```

## �🚉 Overview

This CLI provides access to SEPTA Regional Rail data including:
- 🚂 **Departures**: See all trains leaving from any station with times, tracks, and destinations
- 🎯 **Direct Routes**: Find trains between two specific stations with departure and arrival times  
- 🗺️ **Live Tracking**: View all currently running trains with real-time locations and delays
- 📋 **Train Schedules**: Get complete stop-by-stop schedules for any train number

All data comes from the official SEPTA API and outputs clean markdown tables by default for LLM-friendly parsing. Use `--json` flag for structured JSON output when needed for automation.

## 🛠️ Installation

### Requirements
- Node.js 18+ (for built-in `fetch` support)
- No external dependencies!

### Setup
```bash
cd ~/.openclaw/skills/septa_cli
chmod +x septacli  # Make CLI executable
```

## 📚 Usage Examples

### 🚂 Station Departures

Get all trains departing from a station (northbound and southbound).

**Get next trains from Suburban Station:**
```bash
./septacli departures "Suburban Station"
```

**Limit to 5 results:**
```bash
./septacli departures "Suburban Station" 5
```

**Markdown Output (default):**
```markdown
# Departures from Suburban Station
*Suburban Station Departures: February 23, 2026, 10:47 am*

## Northbound
| Train | Origin | Destination | Line | Path | Depart | Track | Platform | Service | Status |
|-------|--------|-------------|------|------|--------|-------|----------|---------|--------|
| 4224 | Airport Terminal E-F | Norristown | Airport | R4/2N | 2026-02-23 11:05:00.000 | 1 | A | LOCAL | 9 min |
```

**JSON Output (use --json flag):**
```bash
./septacli departures "Suburban Station" 5 --json
```
```json
{
  "station": "Suburban Station",
  "timestamp": "Suburban Station Departures: February 18, 2026, 3:45 pm",
  "northbound": [
    {
      "direction": "N",
      "train_id": "435",
      "origin": "Airport Terminal E-F",
      "destination": "Thorndale",
      "line": "Paoli/Thorndale",
      "path": "R4/2N",
      "depart_time": "3:51 PM",
      "track": "4",
      "platform": "A",
      "service_type": "LOCAL",
      "status": "On Time"
    }
  ],
  "southbound": [...]
}
```

---

### 🎯 Direct Routes Between Stations

Find trains that go directly from one station to another (no transfers).

**30th Street to Airport:**
```bash
./septacli to "30th Street Station" "Airport Terminal A"
```

**Limit to 3 trains:**
```bash
./septacli to "30th Street Station" "Airport Terminal A" 3
```

**Markdown Output (default):**
```markdown
# Trains from Paoli to Suburban Station

| Train | Line | Depart | Arrive | Direct | Status |
|-------|------|--------|---------|--------|--------|
| 5838 | Paoli/Thorndale | 11:41AM | 12:30PM | Yes | On time |
```

**JSON Output (use --json flag):**
```json
{
  "from": "30th Street Station",
  "to": "Airport Terminal A",
  "trains": [
    {
      "orig_train": "5432",
      "orig_line": "Airport",
      "orig_departure_time": "3:55 PM",
      "orig_arrival_time": "4:12 PM",
      "orig_delay": "On time",
      "isdirect": "true"
    }
  ]
}
```

---

### 🗺️ Live Train Tracking

See all currently active Regional Rail trains with real-time positions and status.

**Get all active trains:**
```bash
./septacli trains
```

**Markdown Output (default):**
```markdown
# Active Regional Rail Trains
| Train | Line | Origin | Destination | Current | Next Stop | Service | Track | GPS | Heading | Consist | Status |
|-------|------|--------|-------------|---------|-----------|---------|-------|-----|---------|---------|--------|
| 1711 | Trenton | Market East | Trenton | Jefferson Station | Market East | LOCAL | 3 | 39.9538889,-75.1677778 | 120.1° | - | 20 min late |
```

**JSON Output (use --json flag):**
```json
[
  {
    "lat": "40.0123",
    "lon": "-75.1234",
    "trainno": "2335",
    "service": "LOCAL",
    "dest": "Elwyn Station",
    "currentstop": "Suburban Station",
    "nextstop": "Gray 30th Street",
    "line": "Media/Elwyn",
    "consist": "4",
    "heading": "S",
    "late": 2,
    "SOURCE": "Market East",
    "TRACK": "4",
    "TRACK_CHANGE": ""
  }
]
```

---

### 📋 Detailed Train Schedule

Get the complete stop-by-stop schedule for a specific train.

**Get schedule for train 2335:**
```bash
./septacli train "2335"
```

**Markdown Output (default):**
```markdown
# Schedule for Train 5838

| Station | Scheduled | Estimated | Actual |
|---------|-----------|-----------|--------|
| Malvern | 11:38 am | 11:38 am | na |
| Paoli | 11:41 am | 11:41 am | na |
| Suburban Station | 12:30 pm | 12:30 pm | na |
```

**JSON Output (use --json flag):**
```json
{
  "train_number": "2335",
  "schedule": [
    {
      "station": "Suburban Station",
      "sched_tm": "10:59 pm",
      "est_tm": "10:56 pm",
      "act_tm": "10:56 pm"
    }
  ]
}
```

---

## 🔗 Combining Commands

The CLI is designed for LLMs and scripts to chain commands together for comprehensive answers.

### Scenario 1: Complete Journey Details

**User asks:** "I need to get from 30th Street to Suburban Station, which train should I take and what stops does it make?"

**Workflow:**

1. **Find available trains:**
   ```bash
   ./septacli to "30th Street Station" "Suburban Station"
   ```
   Result: Train 435 departs 3:51 PM, arrives 3:56 PM

2. **Get complete schedule:**
   ```bash
   ./septacli train "435"
   ```
   Result: Shows all stops including Penn Medicine Station at 3:54 PM

3. **Present to user:**
   - "Take train 435 departing 30th Street at 3:51 PM"
   - "Stops: Penn Medicine Station (3:54 PM)"
   - "Arrives Suburban Station at 3:56 PM"

### Scenario 2: Check for Delays

**User asks:** "Are there any delays on airport trains right now?"

**Workflow:**

1. **Get all active trains:**
   ```bash
   ./septacli trains
   ```

2. **Filter for airport destinations:**
   - Check `dest` field for "Airport Terminal A" or "Airport Terminal B"
   - Check `late` field for delay minutes

3. **Present summary:**
   - "Train 5432 to Airport Terminal A: On time, currently at 30th Street"
   - "Train 5434 to Airport Terminal B: 3 minutes late, currently at Penn Medicine"

---

## 📍 Station Names

Station names MUST be exact (including spaces and capitalization).

**Common Stations:**
- `30th Street Station`
- `Suburban Station`
- `Jefferson Station`
- `Airport Terminal A`
- `Airport Terminal B`
- `Temple U`
- `Paoli`
- `Malvern`
- `Norristown TC`
- `Doylestown`
- `Wilmington`

**Full station list:** https://www3.septa.org/VIRegionalRail.html

---

## 💻 Output Format

All commands:
- Output JSON to **stdout only**
- Send errors to **stderr**
- Exit with code **1** on errors
- No debug output - only clean JSON

Perfect for:
- Shell scripts and automation
- LLM/AI agent integration
- Real-time transit apps
- Journey planning tools

---

## ⚠️ Error Handling

**Invalid station name:**
```bash
$ ./septacli departures "NotARealStation"
Error: SEPTA API error: 404 Not Found
```

**Missing arguments:**
```bash
$ ./septacli to "30th Street Station"
Error: Missing stations. Usage: septacli to <fromStation> <toStation> [results]
```

**Invalid train number:**
```bash
$ ./septacli train "99999"
# Returns empty schedule array or error
```

**Network issues:**
```bash
$ ./septacli trains
Error: SEPTA API error: Connection timeout
```

All errors go to stderr with exit code 1.

---

## 🚀 Command Reference

| Command | Description | Required Args | Optional Args |
|---------|-------------|---------------|---------------|
| `departures` | Get all trains leaving a station | `<station>` | `[results]` |
| `to` | Direct trains between two stations | `<from>` `<to>` | `[results]` |
| `trains` | All active trains with live status | None | None |
| `train` | Complete schedule for specific train | `<trainNumber>` | None |

**Defaults:**
- Departures: 10 results
- Direct routes: 5 results

---

## 🔧 Technical Details

- **API Base:** `https://www3.septa.org/api`
- **Authentication:** None required (public API)
- **Rate Limiting:** None specified
- **Data Freshness:** Real-time from SEPTA systems
- **Dependencies:** Zero! Uses only Node.js built-in `fetch`
- **Node Version:** Requires Node.js 18+ for native fetch support

**API Endpoints:**
- Departures: `/Arrivals/index.php`
- Direct Routes: `/NextToArrive/index.php`
- Live Trains: `/TrainView/index.php`
- Train Schedule: `/RRSchedules/index.php`

---

## 🤖 Integration with OpenClaw

This tool is designed as an OpenClaw skill. See [SKILL.md](SKILL.md) for LLM integration details including:
- Tool calling parameters
- Example prompts
- Command chaining strategies
- Response formatting guidelines

---

## 📝 Notes

- **Direct trains only:** The `to` command only shows trains that go directly between stations (no transfers)
- **Station accuracy:** Names must match exactly - "30th Street Station" not "30th St"
- **Real-time data:** Information is live from SEPTA's systems
- **Regional Rail only:** This tool covers SEPTA Regional Rail, not subway, bus, or trolley
- **No trip planning:** Use command chaining to build multi-leg journeys

---

## 📜 License

MIT License

This project uses publicly available SEPTA API data. Please respect SEPTA's terms of service and use responsibly.

---

## 🔗 Resources

- [SEPTA Regional Rail](https://www.septa.org/service/rail/)
- [SEPTA Station List](https://www3.septa.org/VIRegionalRail.html)
- [SEPTA Service Status](https://www.septa.org/status/)
- [SEPTA API Documentation](https://www3.septa.org/)


## Flight Search API Integration Plan

### 1. Edge Function: `flight-search`
- **POST /start** — Starts a search (origin, destination, dates, passengers, class)
  - Generates MD5 signature from token + marker + sorted params
  - Calls `https://tickets-api.travelpayouts.com/search/affiliate/start`
  - Returns `search_id` and `results_url`
- **POST /results** — Polls for results using `search_id` and `last_update_timestamp`
  - Calls `{results_url}/search/affiliate/results`
  - Returns tickets, airlines, agents, flight legs
- **POST /click** — Generates booking link when user clicks "Buy"
  - Calls `{results_url}/searches/{search_id}/clicks/{proposal_id}`
  - Returns redirect URL

### 2. Flight Search Form Component
- Origin & destination inputs (IATA codes)
- Date picker for departure (+ return for round trip)
- Passenger selector (adults, children, infants)
- Trip class selector (Economy/Business/First)
- One-way / Round trip toggle

### 3. Search Results Component
- Loading state with progress indicator (API takes 30-60s)
- Ticket cards showing: airline logo, departure/arrival times, duration, stops, price
- "Book" button per ticket that calls the click endpoint
- Sort by price

### 4. Replace current widget
- Replace TravelpayoutsWidget with the new search form in HeroSection
- Results shown below or on a dedicated results view

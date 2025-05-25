# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AITestbed is a weather forecast web application project designed to provide users with current weather information and forecasts for their location or searched cities. The application focuses on modern UI/UX with responsive design supporting both mobile and desktop platforms.

## Technology Stack

- **Frontend Framework**: Fresh (Preact-based)
- **Styling**: Tailwind CSS
- **State Management**: Preact Signals
- **Runtime**: Deno
- **Language**: TypeScript
- **External API**: OpenWeatherMap API

## Development Commands

Since this is a Fresh/Deno project, use these standard commands:

```bash
# Start development server
deno task start

# Run tests
deno test

# Format code
deno fmt

# Lint code
deno lint

# Check types
deno check **/*.ts
```

## Key Features to Implement

- Current location weather display using browser geolocation API
- City search with autocomplete functionality
- 5-day detailed forecast with hourly breakdowns
- Dark/light theme switching
- PWA support with offline capabilities
- Responsive design (mobile, tablet, desktop)
- Temperature and precipitation charts
- Search history (localStorage, max 10 cities)

## Architecture Notes

- API routes should handle OpenWeatherMap integration
- Weather data interface is defined in docs/requirement.md:200
- Implement proper error handling for network, geolocation, and API failures
- Cache API responses for 5 minutes to optimize performance
- Target Core Web Vitals "Good" rating and Lighthouse score 90+
- HTTPS required for geolocation API access

## API Rate Limits

OpenWeatherMap API is limited to 1000 calls/day in the free tier.
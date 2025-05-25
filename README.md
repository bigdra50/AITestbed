# AITestbed

A modern weather forecast web application that provides current weather information and forecasts for users' current location or searched cities.

## Development Commands

This is a Fresh/Deno project. Use the following standard commands:

```bash
# Start development server
deno task start

# Run tests
deno test

# Format code
deno fmt

# Run lint
deno lint

# Type check
deno check **/*.ts
```

## Important: Code Quality

**Before committing or creating a pull request, always run:**

```bash
deno fmt
deno lint
```

This ensures code consistency and catches potential issues early.

## Quick Start

1. Clone the repository
2. Run `deno task start` to start the development server
3. Open your browser to `http://localhost:8000`

## Tech Stack

- **Frontend Framework**: Fresh (Preact-based)
- **Styling**: Tailwind CSS
- **State Management**: Preact Signals
- **Runtime**: Deno
- **Language**: TypeScript
- **External API**: OpenWeatherMap API

## Contributing

Please ensure you run `deno fmt` and `deno lint` before submitting any changes.

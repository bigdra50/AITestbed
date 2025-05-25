# AITestbed - Weather Forecast Web Application

[![CI](https://github.com/bigdra50/AITestbed/actions/workflows/ci.yml/badge.svg)](https://github.com/bigdra50/AITestbed/actions/workflows/ci.yml)

[日本語版 README はこちら / Japanese README is here](docs/README.jp.md)

## Overview

AITestbed is a modern weather forecast web application designed to provide users with current weather information and forecasts for their current location or searched cities. The application features a responsive design that supports both mobile and desktop platforms with a focus on modern UI/UX.

## Features

- **Current Location Weather**: Automatic location detection using browser's Geolocation API
- **City Search**: Search functionality with autocomplete suggestions
- **5-Day Forecast**: Detailed weather forecast with hourly details
- **Dark/Light Theme**: Toggle between dark and light themes
- **PWA Support**: Offline functionality with service workers
- **Responsive Design**: Support for mobile, tablet, and desktop devices
- **Charts**: Temperature and precipitation visualization
- **Search History**: Remember up to 10 recently searched cities

## Tech Stack

- **Frontend Framework**: Fresh (Preact-based)
- **Styling**: Tailwind CSS
- **State Management**: Preact Signals
- **Runtime**: Deno
- **Language**: TypeScript
- **External API**: OpenWeatherMap API

## Quick Start

### Prerequisites

- Deno 1.x or later
- OpenWeatherMap API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bigdra50/AITestbed.git
cd AITestbed
```

2. Set up environment variables:
```bash
# Create .env file and add your OpenWeatherMap API key
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
```

3. Start the development server:
```bash
deno task start
```

The application will be available at `http://localhost:8000`.

## Development Commands

```bash
# Start development server
deno task start

# Run tests
deno test

# Format code
deno fmt

# Run linter
deno lint

# Type checking
deno check **/*.ts
```

## Architecture

- **API Routes**: Handle OpenWeatherMap API integration
- **Weather Data Interface**: Defined in `docs/requirement.md:200`
- **Error Handling**: Proper handling for network, location, and API failures
- **Caching**: API responses cached for 5 minutes for performance optimization
- **Performance**: Target Core Web Vitals "Good" rating and Lighthouse score 90+
- **Security**: HTTPS required for Geolocation API access

## Project Structure

```
├── components/          # Reusable UI components
├── islands/            # Interactive client-side components
├── routes/             # Application routes and API endpoints
│   └── api/           # API route handlers
├── static/            # Static assets
├── types/             # TypeScript type definitions
├── docs/              # Documentation
└── tailwind.config.ts # Tailwind CSS configuration
```

## API Rate Limits

OpenWeatherMap API has a limit of 1000 calls per day on the free plan.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Git Workflow

This project uses **GitHub Flow**:

1. **Main Branch**: `main` branch is always in a deployable state
2. **Feature Branches**: Create new branches from `main` for new features or fixes
3. **Branch Naming Convention**: 
   - `feature/feature-name` (new features)
   - `fix/fix-description` (bug fixes)
   - `refactor/refactor-description` (refactoring)
4. **Pull Requests**: Create pull requests to `main` branch after work completion
5. **Review**: Code review before merging
6. **CI/CD**: Automated testing, formatting, and linting on pull requests and merges

## Performance Goals

- Initial load time: Under 3 seconds
- Page transition time: Under 1 second
- Core Web Vitals: "Good" rating
- Lighthouse score: 90+

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge latest versions)
- ES2020+ features
- Mobile browser support

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/bigdra50/AITestbed/issues) on GitHub.
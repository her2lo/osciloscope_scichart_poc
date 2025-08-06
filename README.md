# Oscilloscope SciChart POC

This project demonstrates a real-time signal visualization application using SciChart for high-performance charting in both Angular and React implementations.

## Overview

This application provides real-time visualization of multiple signal streams with interactive controls for signal management and axis manipulation. It's designed to handle high-frequency data streaming (100k-200k data points per second) suitable for industrial PLC data visualization.

## Features

### Signal Visualization
- Real-time data streaming and visualization
- Support for multiple signal streams (up to 16+ signals)
- Customizable signal colors and visibility
- High-performance rendering with SciChart

### Interactive Controls
- Toggle visibility of individual signals
- Independent X and Y axis manipulation
- Zoom controls (10% - 200% range)
- Position controls (0% - 100% range)
- Reset view functionality

### Chart Features
- Real-time data updates at 200 Hz
- Automatic and manual scaling
- Time-based X-axis with formatted labels
- Interactive zoom, pan, and cursor functionality
- Legend with checkboxes for series visibility
- Responsive layout

## Technology Stack

### Frontend
- **Angular 17.2.0** - Main application framework
- **React 18** - Alternative implementation
- **SciChart** - High-performance charting library
- **TailwindCSS 3.4.1** - Styling framework
- **TypeScript 5.3.3** - Type safety

### Charting Library Migration
This project has been migrated from LightningChart JS to SciChart for:
- Better performance with large datasets
- More flexible licensing options
- Enhanced customization capabilities
- Better integration with Angular/React ecosystems

## Project Structure

```
src/
├── app/ (Angular)
│   ├── components/
│   │   ├── axis-control/
│   │   ├── icons/
│   │   └── signal-control/
│   ├── models/
│   ├── services/
│   │   └── chart.service.ts (SciChart integration)
│   └── app.component.*
├── App.tsx (React implementation)
└── styles/
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Configuration

### SciChart License
This project uses **SciChart.js Community Edition** which requires no license key and works out of the box with a watermark. 

**Community License Terms:**
- ✅ Non-commercial applications, academic use, personal projects
- ✅ Commercial evaluation (30-60 days)
- ❌ Commercial application development requires a paid license

For commercial use, purchase licenses at [scichart.com](https://www.scichart.com/)

### Performance Settings
The application is configured for high-performance streaming:
- 200 Hz data rate (200 points per second)
- 10-point chunks for efficient updates
- Automatic memory management
- Configurable data generation patterns

## Usage

### Angular Implementation
The main Angular application provides:
- Signal control panel for visibility management
- Axis control sliders for zoom and position
- Real-time chart with interactive features
- Reset and clear data functionality

### React Implementation
Alternative React implementation in `App.tsx` with:
- Simplified interface
- Same SciChart integration
- High-performance data streaming

## Deployment Scenarios

This application supports multiple deployment scenarios as per project requirements:

1. **Desktop App**: Standalone Windows application (offline)
2. **H4U.UI Integration**: Embedded in existing Windows app (offline)
3. **Web Version**: Hosted solution with file upload capability
4. **Mobile App**: WebView-based, running offline

## Performance Characteristics

- **Data Rate**: 100k-200k data points per second
- **Signal Capacity**: 16+ simultaneous signals
- **Memory Management**: Automatic cleanup and optimization
- **Rendering**: Hardware-accelerated via SciChart WebGL

## Development Notes

### Migration from LightningChart
Key changes made during migration:
- Replaced `@arction/lcjs` with `scichart`
- Updated chart initialization and configuration
- Converted series creation and data management
- Adapted axis control and view management
- Updated event handling and interactivity

### Code Organization
- Modular component structure
- Clean separation of concerns
- Type-safe implementations
- Consistent naming conventions

## License

This project uses SciChart under a commercial license. For production use, please obtain an appropriate license from SciChart.

## Future Enhancements

- Additional chart types and visualizations
- Data export capabilities (CSV, JSON, ASCII)
- Advanced filtering and analysis tools
- Historical data viewing
- Custom signal configurations
- Integration with PLC data sources via ADS Secure
- SignalR real-time communication
- Database integration for data persistence
# Real-Time Signal Visualization Application

## Overview

This Angular application provides real-time visualization of multiple signal streams using LightningChart JS. It features an interactive chart with customizable views, signal controls, and axis manipulation capabilities.

## Features

### Signal Visualization
- Real-time data streaming and visualization
- Support for multiple signal streams
- Customizable signal colors and visibility
- Automatic view fitting with manual override options

### Interactive Controls

#### Signal Controls
- Toggle visibility of individual signals
- Visual indicator of signal status
- Color-coded signal identification

#### Axis Controls
- Independent X and Y axis manipulation
- Zoom controls (10% - 200% range)
- Position controls (0% - 100% range)
- Reset view functionality

### Chart Features
- Real-time data updates
- Automatic scaling
- Time-based X-axis with formatted labels
- Responsive layout
- Memory cleanup on component destruction

## Technical Architecture

### Components

#### AppComponent
- Main application container
- Manages chart initialization and control state
- Coordinates between user controls and chart service

#### SignalControlComponent
- Manages signal visibility
- Displays signal information
- Custom eye icon for visibility toggle

#### AxisControlComponent
- Handles axis zoom and position controls
- Supports both horizontal and vertical orientations
- Provides real-time value updates

#### EyeIconComponent
- Custom SVG icon component
- Configurable color and styling
- Interactive hover effects

### Services

#### ChartService
- Manages LightningChart JS integration
- Handles real-time data streaming
- Controls chart view and scaling
- Manages automatic vs manual control modes

### Models

#### Signal Interface
\`\`\`typescript
interface Signal {
  name: string;
  color: string;
  series?: any;
  visible: boolean;
}
\`\`\`

## Implementation Details

### Data Streaming
- 200 points per second update rate
- 10-point chunks for efficient updates
- Automatic memory management
- Configurable data generation patterns

### View Management
- Automatic view fitting for initial state
- Manual control mode when using sliders
- Reset capability to return to automatic fitting
- Independent axis control

### Styling
- Tailwind CSS for responsive layout
- Custom CSS for specialized components
- SVG-based icons
- Consistent color scheme

## Dependencies

### Main Dependencies
- Angular 17.2.0
- LightningChart JS 5.1.1
- TailwindCSS 3.4.1

### Development Dependencies
- TypeScript 5.3.3
- Various Angular development tools

## Project Structure

\`\`\`
src/
├── app/
│   ├── components/
│   │   ├── axis-control/
│   │   ├── icons/
│   │   └── signal-control/
│   ├── models/
│   ├── services/
│   └── app.component.*
├── assets/
└── styles.css
\`\`\`

## Usage

### Starting the Application
\`\`\`bash
npm run start
\`\`\`

### Building for Production
\`\`\`bash
npm run build
\`\`\`

## Best Practices

### Performance Optimization
- Efficient data streaming implementation
- Component cleanup on destruction
- Optimized rendering cycles
- Memory leak prevention

### Code Organization
- Modular component structure
- Clear separation of concerns
- Type-safe implementations
- Consistent naming conventions

### Styling Guidelines
- Responsive design principles
- Mobile-friendly layouts
- Consistent color scheme
- Interactive element feedback

## Future Enhancements

Potential areas for future development:

1. Additional chart types and visualizations
2. Data export capabilities
3. Custom signal configurations
4. Advanced filtering options
5. Historical data viewing
6. More interactive features
7. Additional customization options
8. Performance optimizations for larger datasets

## License

This project uses LightningChart JS under a trial license. For production use, please obtain an appropriate license from LightningChart.
# :raccoon:  RF Pulse Viewer
App for visualizing and analyzing pulse data. Based on Vue 3, vitejs and [Pulseplot](https://github.com/triq-org/pulseplot-js/)

## Features
- **Interactive Visualizations**. Users can create dynamic plots that allow for zooming and panning, making it easier to analyze specific segments of the data.
- **Data Handling**. Supports various formats of input data which makes it versatile for different datasets.
- compatible for ESP32 with CC1101
- **Data Analysis**. Provides advanced analytics that can be used to identify trends and patterns in the data.
- **Data Storage**. Supports local storage to store and retrieve data for future analysis.
- **Responsive**. The app is designed to be responsive and work on all devices.

## Installation

1. Clone the repository: `git clone https://github.com/your-username/project-name.git`
2. Install dependencies: `npm install`
3. Set up environment variables (if necessary): `cp .env.example .env`
4. Start the project: `npm start`

## Usage

```bash
git clone https://github.com/avfrancev/pulseviewer.git
cd pulseviewer
pnpm install
pnpm dev
```

## Building
``` bash
pnpm build
```

## Building for ESP32
Build as single file with gzip
``` bash
pnpm build:esp32
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request
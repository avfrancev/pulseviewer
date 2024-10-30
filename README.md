# :raccoon:  RF Pulse Viewer
App for visualizing and analyzing pulse data. Based on Vue 3, vitejs and [Pulseplot](https://github.com/triq-org/pulseplot-js/)

![Снимок экрана 2024-10-30 в 09 56 24](https://github.com/user-attachments/assets/ea90f348-5ed8-4099-bff7-77badf1e2d07)

Demo available at: [https://avfrancev.github.io/pulseviewer/](https://avfrancev.github.io/pulseviewer/)

## Features
- **Interactive Visualizations**. Users can create dynamic plots that allow for zooming and panning, making it easier to analyze specific segments of the data.
- **Data Handling**. Supports various formats of input data which makes it versatile for different datasets.
- **Data Analysis**. Provides advanced analytics that can be used to identify trends and patterns in the data.
- **Data Storage**. Supports local storage to store and retrieve data for future analysis.
- **Responsive**. The app is designed to be responsive and work on all devices.
- **Webworkers**. Supports webworkers for faster data processing.

## Installation

1. Clone the repository: `git clone https://github.com/avfrancev/pulseviewer.git`
2. Install dependencies: `npm install`

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

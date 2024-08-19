# :raccoon:  RF Pulse Viewer
App for decode and analyzing RF pulses data. Based on [Pulseplot](https://github.com/triq-org/pulseplot-js/)

## Features
- build with Vue 3 and vitejs
- compatible for ESP32 with CC1101

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
# ⚡ NinjaType

**A minimalist, blazingly fast typing practice application built with Astro and React.**

NinjaType helps you master touch typing with real-time feedback, performance analytics, and a distraction-free interface. Track your words per minute (WPM), analyze your progress with interactive charts, and customize your experience with multiple themes and word sets.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Astro](https://img.shields.io/badge/Astro-5.15.1-blueviolet.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/VivekGupta137?label=Sponsor&logo=github&color=EA4AAA)](https://github.com/sponsors/VivekGupta137)
[![Patreon](https://img.shields.io/badge/Patreon-Support-F96854?logo=patreon)](https://patreon.com/VGupta)

## ✨ Features

- 🎯 **Real-time Typing Test** - Instant feedback on your typing speed and accuracy
- 📊 **Performance Analytics** - Track WPM, accuracy, and progress with interactive charts
- 📈 **Typing Speed History** - View your complete typing history with lifetime and daily best stats, filter by time ranges (1 day, 7 days, 2 weeks, 1 month, all time), and track aggregate statistics
- 🎨 **13+ Beautiful Themes** - Including Dracula, Tokyo Night, Catppuccin, Nord, and more
- 📝 **Multiple Word Sets** - Practice with 1k, 2k, 5k word lists and custom quotes
- ⚙️ **Customizable Settings** - Configure word count, typing modes, and countdown timers
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Lightning Fast** - Built with Astro for optimal performance
- 🎭 **Quote Collections** - Practice with motivational, funny, programming, and brainrot quotes
- 🔄 **State Persistence** - Your settings and preferences are saved automatically
- ⌨️ **Keyboard-focused** - Designed for keyboard warriors

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VivekGupta137/ninjatype.git
cd ninjatype
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open your browser and navigate to `http://localhost:4321`

## 🛠️ Development

### Available Scripts

| Command                   | Action                                              |
| :------------------------ | :-------------------------------------------------- |
| `bun install`            | Install dependencies                                 |
| `bun dev`                | Start dev server at `localhost:4321` + auto version |
| `bun build`              | Build production site to `./dist/`                   |
| `bun preview`            | Preview your build locally before deploying          |
| `bun version:patch`      | Bump patch version (1.0.x)                           |
| `bun version:minor`      | Bump minor version (1.x.0)                           |
| `bun version:major`      | Bump major version (x.0.0)                           |
| `bun deploy`             | Deploy to Cloudflare Workers                         |

### Project Structure

```
ninjatype/
├── public/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── images/            # Images and icons
│   ├── themes/            # CSS theme files
│   └── favicon/           # Favicon and manifest
├── src/
│   ├── components/        # React & Astro components
│   │   ├── analytics/    # Performance tracking components
│   │   ├── charts/       # Data visualization components
│   │   ├── keyboard/     # Typing interface components
│   │   ├── seo/          # SEO and schema components
│   │   ├── settings/     # Configuration components
│   │   └── toolbar/      # UI toolbar components
│   ├── constants/         # App constants and configurations
│   ├── content/           # Markdown content pages
│   ├── data/              # Word lists and quote collections
│   ├── hooks/             # Custom React hooks
│   ├── icons/             # Custom icon components
│   ├── layouts/           # Astro layout templates
│   ├── pages/             # Route pages
│   │   ├── index.astro   # Main typing practice page
│   │   ├── history.astro # Typing history and analytics
│   │   └── api/          # API endpoints
│   ├── store/             # Nanostores state management
│   ├── styles/            # Global styles
│   └── util/              # Utility functions
├── astro.config.mjs       # Astro configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── wrangler.jsonc         # Cloudflare Workers config
```

## 🎨 Themes

NinjaType comes with 13 carefully crafted themes:

- Default
- AMOLED (True Black)
- Catppuccin
- Dracula
- GitHub Dark
- Gruvbox
- Material
- Monokai
- Nord
- One Dark
- Rose Pine
- Solarized Dark
- Tokyo Night

All themes are located in `public/themes/` and can be easily customized.

## 📦 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generation with islands architecture
- **UI Library**: [React](https://react.dev/) - Component-based UI
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores) - Minimal state management
- **Charts**: [Nivo](https://nivo.rocks/) & [Visx](https://airbnb.io/visx/) - Data visualization
- **Icons**: [Iconify](https://iconify.design/) & [Lucide React](https://lucide.dev/)
- **Styling**: CSS with theme system
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime

## 🎯 Usage

1. **Start Typing**: Click on the typing area or press any key to begin
2. **Choose Your Mode**: Select word count (10, 25, 50, 100) or time mode (15s, 30s, 60s, 120s)
3. **Pick a Theme**: Switch themes from the settings to match your style
4. **Select Word Sets**: Choose from different word lists or quote collections
5. **Track Progress**: View your WPM, accuracy, and performance charts in real-time
6. **View History**: Navigate to `/history` to see your complete typing history with lifetime stats, daily bests, and filterable performance data
7. **Reset Anytime**: Press ESC or click the reset button to start over

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- Inspired by various typing practice applications
- Community contributors and testers

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/VivekGupta137/ninjatype/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VivekGupta137/ninjatype/discussions)

### 💖 Support the Project

If you find NinjaType helpful, please consider supporting its development:

- ⭐ **Star this repository** on GitHub
- 💝 **[Sponsor on GitHub](https://github.com/sponsors/VivekGupta137)** - One-time or monthly sponsorship
- 🎨 **[Support on Patreon](https://patreon.com/VGupta)** - Get exclusive perks and early access
- 🐛 **Report bugs** and suggest features
- 🤝 **Contribute** code or documentation

Your support helps keep this project alive and continuously improving!

---

Made with ❤️ by [Vivek Gupta](https://github.com/VivekGupta137)

**Happy Typing! ⚡**

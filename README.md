# Image Detective

A lightweight Nuxt application for inspecting image metadata. Drag and drop any photo to instantly reveal its hidden details — camera settings, GPS coordinates, EXIF tags, and more.

## Features

- **Drag & drop** — drop an image anywhere on the page or click to browse
- **Metadata extraction** — reads EXIF, GPS, and other embedded tags via [`exifr`](https://github.com/MikeKovarik/exifr)
- **Image viewer** — toggle between fit-to-height and fit-to-width modes
- **Tabbed UI** — switch between the image preview and a structured metadata panel
- **Dark mode** — system, light, and dark color modes powered by Nuxt UI
- **Supports** PNG, JPG, GIF, WebP, and SVG

## Tech Stack

|               |                                                   |
| ------------- | ------------------------------------------------- |
| Framework     | [Nuxt 4](https://nuxt.com)                        |
| UI Library   | [Nuxt UI v3](https://ui.nuxt.com)                 |
| Runtime       | [Vue 3](https://vuejs.org) + TypeScript           |
| Metadata      | [`exifr`](https://github.com/MikeKovarik/exifr)   |
| CSS           | Tailwind CSS (via `@nuxt/ui`)                     |
| Package Manager | pnpm                                          |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) 9+

### Install & Run

```bash
# Install dependencies
pnpm install

# Start the dev server (defaults to port 8460)
pnpm dev
```

Open [http://localhost:8460](http://localhost:8460) in your browser.

### Build for Production

```bash
# Static generation (recommended)
pnpm build

# Or SSR build
pnpm build:ssr
```


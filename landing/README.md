# Rayfine Landing Page

Marketing site for Rayfine - the Mantle DeFi Raycast extension.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js / React Three Fiber
- shadcn/ui

## Sections

1. **Hero** - Main CTA with 3D animated sphere
2. **About** - Feature carousel (15+ actions)
3. **Works** - Use cases (Trade, Lend, Stake, Wallet, Oracle)
4. **Tech Marquee** - Scrolling tech stack
5. **Footer** - Links

## Features

- 3D animated sphere (Three.js)
- Smooth scroll animations
- Dark theme
- Custom cursor
- Mobile responsive

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
bun run build
bun start
```

## Project Structure

```
landing/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── hero.tsx
│   ├── about.tsx
│   ├── works.tsx
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── sentient-sphere.tsx
│   ├── tech-marquee.tsx
│   └── ui/           # shadcn components
├── lib/
└── public/
```

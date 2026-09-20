# CLOCK

A premium mobile time utility application built around four essential tools: **Alarm, World Clock, Timer, and Stopwatch**.

CLOCK combines reliable time functionality, local data persistence, accurate time handling, and a modern 3D-inspired interface designed specifically for mobile devices.

## Features

- **Alarm** — Create, edit, delete, enable/disable, and schedule recurring alarms with persistent local storage.
- **World Clock** — Track local time, GMT/UTC, and multiple locations using real timezone data.
- **Timer** — Create named countdown timers, save reusable presets, and manage timer states with accurate timestamp-based calculations.
- **Stopwatch** — Start, pause, resume, reset, and record lap times with accurate elapsed-time measurement.

## Highlights

- Mobile-first interface
- Local-first data persistence
- Accurate timezone and time calculations
- Native alarm and notification support
- Responsive CRUD management
- 3D-inspired visual design
- Smooth and purposeful motion
- Accessibility and reduced-motion considerations
- Performance-focused architecture

## Tech Stack

- React Native
- Expo
- TypeScript
- SQLite
- Zustand
- React Native Reanimated
- Native Notifications
- 3D Rendering

## Architecture

CLOCK follows a modular feature-oriented architecture:

```text
UI
 ↓
State Management
 ↓
Feature / Domain Logic
 ↓
Local Persistence
 ↓
Native APIs
```

Core features are separated into independent modules for maintainability, scalability, and reliable state management.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npx run dev
```

Follow the Expo CLI instructions to run CLOCK on a physical device or emulator.

## Design Philosophy

CLOCK prioritizes functionality and reliability before visual complexity.  
The 3D visual system is used to enhance the experience through depth, lighting, spatial surfaces, and motion while keeping time information clear and interactions intuitive.

## Project Status

**In Development**  
CLOCK is being developed as a production-oriented mobile application focused on reliable time utilities, persistent local data, and premium mobile UX.
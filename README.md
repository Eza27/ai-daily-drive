# AI Workplace Productivity Assistant

A modern, responsive dashboard that helps employees and professionals save time by using AI to handle common workplace tasks. The application combines three AI-powered tools in one integrated platform: a Smart Email Generator, a Meeting Notes Summariser, and an AI Task Planner/Scheduler.

## Features

### 1. Smart Email Generator
- Generate professional workplace emails from a purpose statement and optional key information.
- Choose from three tones: **Formal**, **Friendly**, or **Persuasive**.
- Optionally specify the recipient.
- Review and edit the AI-generated subject and body before copying.
- One-click copy to clipboard.

### 2. Meeting Notes Summariser
- Paste long meeting notes and receive a concise summary.
- Automatically extracts:
  - Key points
  - Decisions made
  - Deadlines mentioned
  - Action items and owners
- Editable output panel for quick refinements.

### 3. AI Task Planner / Scheduler
- Enter multiple tasks and generate a daily or weekly schedule.
- Set your available working hours per day.
- AI prioritises tasks by deadline, priority, and dependencies.
- Output includes time slots, priority labels, deadlines, and scheduling rationale.
- Editable schedule output for last-minute adjustments.

## Design & UX

- Clean, modern SaaS-style dashboard inspired by Linear and Notion AI.
- Fixed sidebar navigation with clear feature switching.
- Responsive layout for desktop, tablet, and mobile.
- Loading skeletons, error states, and smooth transitions.
- Persistent Responsible AI disclaimer.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI primitives + shadcn/ui conventions
- **AI:** [Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway) via the `ai` SDK
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- `bun` or `npm`
- A Lovable AI Gateway key (set automatically in the Lovable environment)

### Install dependencies

```bash
bun install
# or
npm install
```

### Run the development server

```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```bash
bun run build
# or
npm run build
```

### Lint and format

```bash
bun run lint
bun run format
```

## Project Structure

```
src/
├── components/
│   └── AppShell.tsx          # Dashboard layout, sidebar, output panel
├── lib/
│   ├── ai.functions.ts       # Server functions for email, notes, and planner
│   ├── ai-gateway.server.ts  # AI provider configuration
│   └── utils.ts              # Utility helpers
├── routes/
│   ├── __root.tsx            # Root layout with fonts and metadata
│   ├── index.tsx             # Smart Email Generator
│   ├── summariser.tsx        # Meeting Notes Summariser
│   └── planner.tsx           # AI Task Planner
├── styles.css                # Tailwind v4 theme and design tokens
└── ...
```

## Responsible AI

AI-generated content may contain errors or omissions. Please review and verify AI-generated information before using it for important workplace communication, decisions, or actions.

The AI is instructed to use only the information you provide and to avoid inventing facts, deadlines, decisions, or other details. Always treat generated content as a draft that requires human review.

## Deployment

This project is built for the Lovable platform and can be published directly from the Lovable editor. Environment variables required by the AI Gateway are managed by Lovable Cloud.

## License

This project is provided as-is for demonstration and productivity use.

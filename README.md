# Columbia Help Out

A React + TypeScript + Vite project for Columbia University students to share and claim tasks.

## Features

- Browse available tasks on campus
- Post new tasks with credits reward
- Claim and complete tasks
- Track your published and claimed tasks

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd columbia-help-out

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/           # Task service and mock data
├── components/    # React components
│   ├── layout/    # Layout components (Sidebar, Header, etc.)
│   └── tasks/     # Task-related components
├── styles/        # CSS styles
├── utils/         # Utility functions
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

## Development Notes

- Uses mock data for demonstration (no backend required)
- Cross-platform compatible (Windows, macOS, Linux)
- Responsive design for desktop and mobile

## License

MIT


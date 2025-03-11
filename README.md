# GameHub - Multi-Game Platform

GameHub is a modern web platform for playing classic board and card games with customizable themes, multiplayer support, and AI opponents.

## Features

- **Multiple Games**: Chess, Ludo, Russian Rummy, Hearts, Solitaire, Spades, Yahtzee, and Judgement
- **Customizable Themes**: Change the appearance of backgrounds, cards, dice, chess pieces, and game boards
- **User Authentication**: Play as a guest or sign in with email, Google, Facebook, or Twitter
- **Game Progress**: Save your game progress whether you're logged in or playing as a guest
- **Multiplayer Support**: Play against friends or match with other players online
- **AI Opponents**: Challenge computer opponents with various difficulty levels
- **Responsive Design**: Play on desktop, tablet, or mobile devices

## Screenshots

Here are some screenshots of the GameHub platform:

![GameHub Screenshot 1](/public/screenshots/Screenshot%202025-03-11%20at%2010.03.59%20AM.png)
![GameHub Screenshot 2](/public/screenshots/Screenshot%202025-03-11%20at%2010.04.12%20AM.png)
![GameHub Screenshot 3](/public/screenshots/Screenshot%202025-03-11%20at%2010.04.39%20AM.png)
![GameHub Screenshot 4](/public/screenshots/Screenshot%202025-03-11%20at%2010.05.10%20AM.png)
![GameHub Screenshot 5](/public/screenshots/Screenshot%202025-03-11%20at%2010.05.31%20AM.png)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Database**: Supabase
- **Real-time Communication**: Socket.io
- **Animations**: Framer Motion
- **Sound Effects**: Howler.js

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nishitkamdar/gamehub.git
   cd gamehub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_CLIENT_ID=your_facebook_client_id
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
gaming-platform/
├── public/            # Static assets
│   ├── assets/        # Game assets
│   │   ├── images/        # Images
│   │   └── sounds/        # Sound effects
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── (auth)/    # Authentication routes
│   │   │   ├── api/       # API routes
│   │   │   ├── games/     # Game routes
│   │   │   └── ...
│   │   │   ├── components/    # React components
│   │   │   │   ├── auth/      # Authentication components
│   │   │   │   ├── games/     # Game-specific components
│   │   │   │   ├── layout/    # Layout components
│   │   │   │   └── ui/        # UI components
│   │   │   │   ├── lib/           # Utility functions and hooks
│   │   │   │   │   ├── auth/      # Authentication utilities
│   │   │   │   │   ├── games/     # Game logic
│   │   │   │   │   ├── hooks/     # Custom hooks
│   │   │   │   │   ├── supabase/  # Supabase client
│   │   │   │   │   └── utils/     # Utility functions
│   │   │   └── styles/        # Global styles
│   │   └── ...
│   └── ...
```

## Game Implementation

Each game is implemented as a separate module with its own logic, components, and state management. The games follow a common interface to ensure consistency across the platform.

### Adding a New Game

To add a new game to the platform:

1. Create a new directory in `src/app/games/your-game-name/`
2. Implement the game logic in `src/lib/games/your-game-name/`
3. Create game-specific components in `src/components/games/your-game-name/`
4. Add the game to the games list in `src/app/games/page.tsx`

## Theme Customization

The platform supports customizing various aspects of the games:

- Background themes
- Card designs
- Dice styles
- Chess and Ludo piece designs
- Board layouts

Themes are managed through the ThemeContext provider and stored in localStorage or the user's profile if logged in.

## Multiplayer Support

Multiplayer functionality is implemented using Socket.io for real-time communication between players. The platform supports:

- Creating game rooms
- Inviting friends
- Matchmaking with random players
- Chat during gameplay

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Socket.io](https://socket.io/)
- [Framer Motion](https://www.framer.com/motion/)
- [Howler.js](https://howlerjs.com/)

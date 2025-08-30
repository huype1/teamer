# Teamer Frontend

Frontend application for Teamer - a team collaboration platform built with React, TypeScript, and Vite.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with shadcn/ui components
- **Redux Toolkit** for state management
- **Axios** for API communication

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Development Environment
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=http://localhost:8080/api/ws
VITE_FRONTEND_URL=http://localhost:5173

# Google OAuth (if needed)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Note**: WebSocket URL uses `http/https` instead of `ws/wss` because SockJS requires HTTP scheme URLs.

### Running the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment

### Netlify Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Set Environment Variables in Netlify**
   - Go to your Netlify dashboard
   - Navigate to Site settings > Environment variables
   - Add the following variables:
   
   ```bash
   VITE_API_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api
   VITE_WS_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api/ws
   VITE_FRONTEND_URL=https://your-app-name.netlify.app
   VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
   ```

3. **Deploy**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy!

### Environment Configuration

The application automatically detects the environment and uses the appropriate API endpoints:

- **Development**: Uses localhost:8080 for API calls
- **Production**: Uses Heroku URL for API calls

### API Endpoints

All service files are configured to use environment variables:
- `authService.ts` - Authentication endpoints
- `userService.ts` - User management
- `teamService.ts` - Team management
- `projectService.ts` - Project management
- `issueService.ts` - Issue tracking
- `sprintService.ts` - Sprint management
- `chatService.ts` - Real-time chat
- `notificationService.ts` - Notifications
- `attachmentService.ts` - File attachments
- `documentService.ts` - Document management

## Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── service/            # API service layer
├── store/              # Redux state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── config/             # Configuration files
```

## Contributing

1. Follow the established code patterns
2. Use TypeScript for all new code
3. Follow the component structure in `components/`
4. Update types when adding new features
5. Test your changes before committing

## Support

For issues or questions, please check the project documentation or create an issue in the repository.

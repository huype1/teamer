# Vercel Deployment Setup

## Environment Variables Setup

### For Local Development
Create a `.env.local` file in the frontend directory:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080/api/ws
```

### For Vercel Production
Set these environment variables in your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:

```
VITE_API_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api
VITE_WS_BASE_URL=wss://teamer-b55248b6da98.herokuapp.com/api/ws
```

## Next Steps for Vercel Deployment

1. **Push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Update API configuration for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - If you haven't connected your GitHub repo to Vercel yet:
     - Go to [vercel.com](https://vercel.com)
     - Click "New Project"
     - Import your GitHub repository
     - Set the root directory to `frontend`
     - Set the build command to: `npm run build`
     - Set the output directory to: `dist`

3. **Verify Environment Variables**
   - After deployment, check that your app is connecting to the Heroku backend
   - Test login/registration functionality
   - Test WebSocket connections for real-time features

## Heroku Backend Compatibility

Your Heroku backend should work seamlessly with Vercel frontend because:
- ✅ CORS is already configured in your Spring Boot backend
- ✅ All API endpoints are properly set up
- ✅ WebSocket endpoints are configured
- ✅ Environment variables are now properly managed

## Troubleshooting

If you encounter issues:
1. Check Vercel build logs for any errors
2. Verify environment variables are set correctly
3. Test API connectivity from Vercel to Heroku
4. Check browser console for any CORS or connection errors 
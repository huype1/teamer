import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Polyfill for sockjs-client
if (typeof global === 'undefined') {
  (window as unknown as { global: typeof window }).global = window;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '647768355555-ofa88gojqg46s7c5ph3irvv5cpfpm8a2.apps.googleusercontent.com';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);

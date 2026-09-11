import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import App from './App';
import { AuthProvider } from "./context/AuthContext";


import { VideoPlayerProvider } from "./context/VideoPlayerContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <VideoPlayerProvider>
        <App />
      </VideoPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);


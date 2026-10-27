import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

// Mount the React application inside the HTML root and enable client-side routing.
createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>,
);

import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { Api } from "./RTK/ApiRequests.js";

createRoot(document.getElementById('root')).render(
  <ApiProvider api={Api}>
    <App />
  </ApiProvider>,
)

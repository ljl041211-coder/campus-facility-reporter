import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Leaflet's own styles must load before ours (App.jsx loads App.css),
// so that our CSS can override Leaflet's defaults.
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

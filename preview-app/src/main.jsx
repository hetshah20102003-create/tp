import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GenieAdminDashboard from './GenieAdminDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GenieAdminDashboard />
  </StrictMode>,
)

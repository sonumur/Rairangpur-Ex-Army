import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ImageProvider } from './context/ImageContext.jsx'
import { HeroProvider } from './context/HeroContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AdminAuthProvider>
        <ImageProvider>
          <HeroProvider>
            <App />
          </HeroProvider>
        </ImageProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

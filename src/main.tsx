import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyDevBootstrapSideEffects, getDevBootstrapConfig } from './game/devBootstrap'
import { getLocale } from './i18n/locale'
import App from './App'
import './styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found.')
}

document.documentElement.lang = getLocale() === 'ja' ? 'ja' : 'en'

const devBootstrap = getDevBootstrapConfig()
if (devBootstrap) {
  applyDevBootstrapSideEffects(devBootstrap.phase)
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

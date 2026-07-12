import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>,
)

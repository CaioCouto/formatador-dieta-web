import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './normalize.css'
import './index.css'
import App from './App.jsx'
import { 
  BrowserRouter as Router
} from 'react-router-dom';
import { Provider } from 'jotai'
import { AppWrapper } from './components'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Provider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </Provider>
    </Router>
  </StrictMode>,
)

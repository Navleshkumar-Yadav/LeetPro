import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import {store} from "./store/store.js"
import { Provider } from 'react-redux';
import { PointNotificationProvider } from './components/PointNotificationProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <PointNotificationProvider>
      <App />
    </PointNotificationProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)

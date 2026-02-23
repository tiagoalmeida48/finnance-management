import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/supabase/auth-context'
import { SiteBrandingProvider } from './shared/contexts/site-branding-context'
import App from './App'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteBrandingProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SiteBrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

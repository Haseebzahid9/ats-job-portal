import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/auth_context'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{ top: 80 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#111827',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '0.9rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: {
                  primary: '#6ea84d',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)

import { Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/common/Loader'

/**
 * ScrollToTop — scrolls the window to the top on every route change.
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<Loader />}>
        <AppRoutes />
      </Suspense>
      <Footer />
    </>
  )
}

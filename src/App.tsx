import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listings from './pages/Listings'
import Property from './pages/Property'
import Sejours from './pages/Sejours'
import Sejour from './pages/Sejour'
import TeamBuilding from './pages/TeamBuilding'
import { Contact, Credits, Deposer } from './pages/Static'

function Layout() {
  const { pathname } = useLocation()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header overlay={pathname === '/' || pathname === '/team-building'} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations-vacances" element={<Sejours />} />
          <Route path="/sejour/:slug" element={<Sejour />} />
          <Route path="/team-building" element={<TeamBuilding />} />
          <Route path="/acheter" element={<Listings rubrique="acheter" />} />
          <Route path="/louer" element={<Listings rubrique="louer" />} />
          <Route path="/bureaux-et-commerces" element={<Listings rubrique="bureaux-et-commerces" />} />
          <Route path="/favoris" element={<Listings rubrique="acheter" favoritesOnly />} />
          <Route path="/bien/:id" element={<Property />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/deposer" element={<Deposer />} />
          <Route path="/credits-photos" element={<Credits />} />
          {/* anciennes adresses */}
          <Route path="/location-vacances" element={<Navigate to="/locations-vacances" replace />} />
          <Route path="/agences" element={<Navigate to="/contact" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

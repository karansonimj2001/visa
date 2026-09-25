import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import CountryPage from './pages/CountryPage'
import VisaTypePage from './pages/VisaTypePage'
import ApplyPage from './pages/ApplyPage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import TrackPage from './pages/TrackPage'
import NotFound from './pages/NotFound'

function Navbar() {
  return (
    <nav className="bg-blue-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <NavLink to="/" className="text-xl font-bold hover:text-blue-200">DubaiVisa</NavLink>
        <div className="flex gap-4 text-sm">
          <NavLink to="/" className="hover:text-blue-200">Home</NavLink>
          <NavLink to="/track" className="hover:text-blue-200">Track</NavLink>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center p-4 text-sm mt-12">
      &copy; {new Date().getFullYear()} DubaiVisa. All rights reserved.
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countries/:slug" element={<CountryPage />} />
          <Route path="/visa-types/:slug" element={<VisaTypePage />} />
          <Route path="/apply/:visaTypeSlug" element={<ApplyPage />} />
          <Route path="/payment/:applicationId" element={<PaymentPage />} />
          <Route path="/confirmation/:referenceNumber" element={<ConfirmationPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

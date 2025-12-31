import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<div className="p-10">Browse (Coming Soon)</div>} />
            <Route path="/watchlist" element={<div className="p-10">Watchlist (Coming Soon)</div>} />
            <Route path="/movies" element={<div className="p-10">Movies (Coming Soon)</div>} />
            <Route path="/tv-shows" element={<div className="p-10">TV Shows (Coming Soon)</div>} />
            <Route path="/anime" element={<div className="p-10">Anime (Coming Soon)</div>} />
            <Route path="/kids" element={<div className="p-10">Kids (Coming Soon)</div>} />
            <Route path="/community" element={<div className="p-10">Community (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

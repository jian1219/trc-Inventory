import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from './pages/Login';
import Home from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import PettyCash from './pages/Petty_cash';
import Inventory from './pages/Inventory'

function App() {
  const [count, setCount] = useState(0)

  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<Home/>} />
        <Route path="/ingredients" element={<Ingredients/>} />
        <Route path="/petty-cash" element={<PettyCash/>} />
        <Route path="/inventory" element={<Inventory/>} />
       
      </Routes>
    </Router>

  )
}

export default App

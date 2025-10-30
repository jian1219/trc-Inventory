import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute'
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
            {/* Public route */}
        <Route path="/" element={<Login/>} />

            {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ingredients" 
          element={
            <ProtectedRoute>
              <Ingredients />
            </ProtectedRoute>
          }
        />
         <Route 
          path="/petty-cash" 
          element={
            <ProtectedRoute>
              <PettyCash />
            </ProtectedRoute>
          }
        />
         <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

       
      </Routes>
    </Router>

  )
}

export default App

import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from './pages/Login';

function App() {
  const [count, setCount] = useState(0)

  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
       
      </Routes>
    </Router>

  )
}

export default App

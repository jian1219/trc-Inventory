import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'


const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase
      .from('barista_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    setLoading(false)

    if (error || !data) {
      setError('Invalid username or password ❌')
    } else {
      console.log('✅ Login success:', data)
      navigate('/dashboard')
    }
  }

  return (
    <div className='login_page'>
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">TRC INVENTORY</h2>

                <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                    <label>Username</label>
                    <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login

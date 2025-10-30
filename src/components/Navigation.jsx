import React from 'react';
import { useNavigate } from 'react-router-dom'
import logo from '../images/logo_trc.png';

const Navigation = () => {

    const navigate = useNavigate()

    const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
}


    return (
        <div className='navigation'>
            <div className='left'>
                <img className='nav_logo' src={logo} alt="" />
                <p>Hello Barista!</p>
            </div>
            <div className='right'>
                <div className='button-list'>
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button onClick={() => navigate('/inventory')}>Inventory</button>
                    <button onClick={() => navigate('/petty-cash')}>Expense</button>
                    <button onClick={() => navigate('/ingredients')}>Ingredients</button>
                    <button onClick={handleLogout} className='logout'>Logout</button>
                </div>

            </div>
        </div>
    );
}

export default Navigation;

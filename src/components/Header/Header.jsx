import { useContext, useState } from 'react';
import './Header.css';
import AppContext from '../../providers/AppContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';

function Header({ setSearchQuery }) {
    const user = useContext(AppContext);
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const showSearch =
        location.pathname === '/' ||
        location.pathname === '/premier-league' ||
        location.pathname === '/fantasy-premier-league';

    return (
        <div id="header">
            <NavLink className='home' to='/'><h1>React Fantasy Football Forum</h1></NavLink>
            {!user.user ? (
                <NavLink to='/auth-gate'>Login / Register</NavLink>
            ) : (
                <>
                    <input
                        className={`search-input ${showSearch ? 'visible' : 'hidden'}`}
                        name='search'
                        type='text'
                        placeholder='Search...'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchQuery(input.trim().toLowerCase());
                                setInput('');
                            }
                        }}
                    />
                    <NavLink to="/premier-league">Premier League</NavLink>
                    <NavLink to="/fantasy-premier-league">Fantasy Premier League</NavLink>
                    <div className='divider'></div>
                    <button className='create-post' onClick={() => navigate('/create-post')}>+</button>
                    <NavLink to={`/account`}>Account</NavLink>
                    <button onClick={() => logoutUser()}>Log Out</button>
                </>
            )}
        </div>
    );
};

export default Header;

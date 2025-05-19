import { useContext, useRef, useState } from 'react';
import './Header.css';
import AppContext from '../../providers/AppContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';

function Header() {
    const user = useContext(AppContext);
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const searchRef = useRef();

    const handleFocus = () => {
        searchRef.current.select();
    }

    const handleSearch = () => {
        const encodedQuery = encodeURIComponent(input);
        navigate(`/search/${encodedQuery}`);
    }

    return (
        <div id="header">
            <NavLink className='home' to='/'><h1>React Fantasy Football Forum</h1></NavLink>
            {!user.user ? (
                <NavLink to='/auth-gate'>Login / Register</NavLink>
            ) : (
                <>
                    <input
                        className={`search-input`}
                        ref={searchRef}
                        name='search'
                        type='text'
                        placeholder='Search everything...'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={handleFocus}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
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

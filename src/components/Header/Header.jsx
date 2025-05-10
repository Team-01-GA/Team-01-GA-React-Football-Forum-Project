import { useContext } from 'react';
import './Header.css';
import AppContext from '../../providers/AppContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';

function Header() {
    const user = useContext(AppContext);

    const navigate = useNavigate();

    return (
        <div id="header">
            <h1>React Fantasy Football Forum</h1>
            {!user.user ? (
                <button onClick={() => navigate('/auth-gate')}>Login / Register</button>
            ) : (
                <>
                    <button>SearchBar</button>
                    <NavLink to='/all-posts'>All Posts</NavLink>
                    <NavLink to="/premier-league">Premier League</NavLink>
                    <NavLink to="/fantasy-premier-league">Fantasy Premier League</NavLink>
                    <NavLink to='/create-post'>+</NavLink>
                    <NavLink to='/account'>Account</NavLink>
                    <button onClick={() => logoutUser()}>Log Out</button>
                </>
            )}
        </div>
    );
};

export default Header;

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
                    <NavLink>+</NavLink>
                    <NavLink>Account</NavLink>
                    <button onClick={() => logoutUser()}>Log Out</button>
                </>
            )}
        </div>
    );
};

export default Header;

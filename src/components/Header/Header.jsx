import { useContext } from 'react';
import './Header.css';
import AppContext from '../../providers/AppContext';
import { NavLink } from 'react-router-dom';

function Header() {
    const user = useContext(AppContext);

    return (
        <div id='header'>
            <h1>React Fantasy Football Forum</h1>
            {!user.user 
                ? <NavLink to='/auth'>Login / Register</NavLink> 
                : <>
                    <button>SearchBar</button>
                    <NavLink>+</NavLink>
                    <NavLink>Account</NavLink>
                </>
            }
        </div>
    );
};

export default Header;

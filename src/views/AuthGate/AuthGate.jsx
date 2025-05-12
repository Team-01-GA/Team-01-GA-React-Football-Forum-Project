import { useState } from 'react';
import './AuthGate.css';
import Login from '../../components/Login/Login';
import Register from '../../components/Register/Register';
import AuthError from '../../components/AuthError/AuthError';

function AuthGate() {

    // true - Register, false - Login \/
    const [isNew, setIsNew] = useState(true);

    const [authError, setAuthError] = useState(null);

    return (
        <>
            <div id="auth-wrapper">
                <div id='auth-switcher'>
                    <button className={isNew ? 'auth-active-button' : ''} onClick={() => setIsNew(true)}>Register</button>
                    <button className={!isNew ? 'auth-active-button' : ''} onClick={() => setIsNew(false)}>Login</button>
                </div>
                <div id='auth-form'>
                    <Login setError={setAuthError} active={!isNew}/>
                    <Register setError={setAuthError} active={isNew}/>
                </div>
                {authError && <AuthError setError={setAuthError} message={authError}/>}
            </div>
        </>
    );
}

export default AuthGate;

import { useEffect, useState } from 'react';
import './AuthGate.css';
import Login from '../../components/Login/Login';
import Register from '../../components/Register/Register';
import AuthError from '../../components/AuthError/AuthError';

function AuthGate() {
    const [authError, setAuthError] = useState(null);
    const [authSwitcher, setAuthSwitcher] = useState(1);

    useEffect(() => {
        document.title = 'Authentication - React Fantasy Football Forum';
    }, []);

    const handleSetError = async (message) => {
        setAuthError(message);
        await new Promise(resolve => setTimeout(resolve, 6000));
        setAuthError(null);
    }

    return (
        <>
            <div id="auth-wrapper">
                <div id="auth-form" className='glassmorphic-bg'>
                    <div id="auth-switcher">
                        <div className="button-container">
                            <button
                                className={`button-highlight ${
                                    authSwitcher === 1
                                        ? 'highlight-register'
                                        : 'highlight-login'
                                }`}
                                disabled
                            >{authSwitcher === 1 ? 'Regsiter' : 'Login'}</button>
                            <button onClick={() => setAuthSwitcher(1)}>
                                Register
                            </button>
                            <button onClick={() => setAuthSwitcher(2)}>
                                Login
                            </button>
                        </div>
                    </div>
                    <div id='form-wrapper'>
                        <Register setError={handleSetError} active={authSwitcher === 1} />
                        <Login setError={handleSetError} active={authSwitcher === 2} />
                    </div>
                </div>
                {authError && (
                    <AuthError message={authError} />
                )}
            </div>
        </>
    );
}

export default AuthGate;

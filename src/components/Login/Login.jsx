import { useContext, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { loginUser } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

export default function Login({ setError, active }) {

    const [ fields, setFields ] = useState({
        email: '',
        password: '',
    });
    const { setContext } = useContext(AppContext);

    const navigate = useNavigate();

    const onLogin = () => {
        if (!fields.email || !fields.email.includes('@') || !fields.email.includes('.')) {
            return setError('Please provide a valid email address.')
        }
        if (!fields.password) {
            return setError('Please provide a password.');
        }

        loginUser(fields.email, fields.password)
            .then(credential => {
                setContext({
                    user: credential.user,
                });
            })
            .then(() => {
                navigate('/');
            })
            .catch(e => {
                if (e.message.includes('wrong-password')) {
                    setError('Invalid credentials.');
                    return;
                }
                setError(e.message);
            });
    };

    const saveInputs = (field, value) => {
        setFields({
            ...fields,
            [field]: value,
        });
    };

    return (
        <div className={`login-form ${active ? 'auth-active' : ''}`}>
            <h3 className='auth-title'>Welcome back!</h3>
            <input name='email-login' placeholder='Email' type="email" value={fields.email} onChange={e => saveInputs('email', e.target.value)}/>
            <input name='password-login' placeholder='Password' type="password" value={fields.password} onChange={e => saveInputs('password', e.target.value)}/>
            <input type="text" style={{ visibility: 'hidden' }} readOnly disabled />
            <button className='auth-submit' onClick={onLogin}>Sign in</button>
        </div>
    );
};

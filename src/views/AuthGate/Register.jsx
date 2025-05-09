import { useContext, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { createUserHandle, getUserByHandle } from '../../services/user.service';
import { registerUser } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

export default function Registration({ setError, active }) {

    const [ fields, setFields ] = useState({
        handle: '',
        email: '',
        password: '',
    });
    const { setContext } = useContext(AppContext);

    const navigate = useNavigate();

    const onRegister = () => {
        if (!fields.handle) {
            return setError('Please enter a handle.');
        }
        if (!fields.email || !fields.email.includes('@') || !fields.email.includes('.')) {
            return setError('Please enter a valid email address.');
        }
        if (!fields.password) {
            return setError('Please enter a password.');
        }

        getUserByHandle(fields.handle)
            .then(snapshot => {
                if (snapshot.exists()) {
                    throw new Error(`Handle @${fields.handle} has already been taken.`);
                }

                return registerUser(fields.email, fields.password);
            })
            .then(credential => {
                return createUserHandle(fields.handle, credential.user.uid, credential.user.email)
                    .then(() => {
                        setContext({
                            user: credential.user,
                        });
                    });
            })
            .then(() => {
                navigate('/');
            })
            .catch(e => {
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
        <div className={`register-form ${active ? 'auth-active' : ''}`}>
            <h3 className='auth-title'>Get Started</h3>
            <input placeholder='Email' type="email" value={fields.email} onChange={e => saveInputs('email', e.target.value)}/>
            <input placeholder='Password' type="password" value={fields.password} onChange={e => saveInputs('password', e.target.value)}/>
            <input placeholder='Handle' type="text" value={fields.handle} onChange={e => saveInputs('handle', e.target.value)}/>
            <button onClick={onRegister}>Sign up</button>
        </div>
    );
};

import { useContext, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { createUserObject, getUserByEmail, getUserByHandle } from '../../services/user.service';
import { registerUser } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const MIN_NAME_LENGTH = 4;
const MAX_NAME_LENGTH = 32;

export default function Registration({ setError, active }) {

    const [ fields, setFields ] = useState({
        firstName: '',
        lastName: '',
        handle: '',
        email: '',
        password: '',
    });
    const { setContext } = useContext(AppContext);

    const navigate = useNavigate();

    const onRegister = async () => {
        if (!fields.firstName || fields.firstName.length < MIN_NAME_LENGTH || fields.firstName.length > MAX_NAME_LENGTH) {
            return setError('First name must be between 4 and 32 characters.');
        }
        if (!fields.lastName || fields.lastName.length < MIN_NAME_LENGTH || fields.lastName.length > MAX_NAME_LENGTH) {
            return setError('Last name must be between 4 and 32 characters.');
        }
        if (!fields.handle) {
            return setError('Please enter a handle.');
        }
        if (!fields.email || !fields.email.includes('@') || !fields.email.includes('.')) {
            return setError('Please enter a valid email address.');
        }
        if (!fields.password) {
            return setError('Please enter a password.');
        }

        const normalisedEmail = fields.email.toLowerCase();
        const normalisedHandle = fields.handle.toLowerCase();

        try {
            let snapshot = await getUserByHandle(normalisedHandle);
            if (snapshot.exists()) {
                throw new Error(`Username ${normalisedHandle} has already been taken.`);
            }

            snapshot = await getUserByEmail(normalisedEmail);
            if (snapshot.exists()) {
                throw new Error(`Email ${normalisedEmail} has already been taken.`);
            }

            const credential = await registerUser(normalisedEmail, fields.password);

            await createUserObject(fields.firstName, fields.lastName, normalisedHandle, credential.user.uid, credential.user.email);

            setContext({
                user: credential.user,
            });

            navigate('/');
        }
        catch (e) {
            setError(e.message);
        }
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
            <div className='auth-names'>
                <input name='first-name' placeholder='First Name' type="text" value={fields.firstName} onChange={e => saveInputs('firstName', e.target.value)}/>
                <input name='last-name' placeholder='Last Name' type="text" value={fields.lastName} onChange={e => saveInputs('lastName', e.target.value)}/>
            </div>
            <input name='handle' placeholder='Username' type="text" value={fields.handle} onChange={e => saveInputs('handle', e.target.value)}/>
            <input name='email-register' placeholder='Email' type="email" value={fields.email} onChange={e => saveInputs('email', e.target.value)}/>
            <input name='password-register' placeholder='Password' type="password" value={fields.password} onChange={e => saveInputs('password', e.target.value)}/>
            <button className='auth-submit' onClick={onRegister}>Sign up</button>
        </div>
    );
};

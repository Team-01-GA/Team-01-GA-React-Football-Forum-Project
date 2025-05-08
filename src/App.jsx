import { useEffect, useState } from 'react';
import './App.css';
import AppContext from './providers/AppContext';
import { BrowserRouter, Routes } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';
import { getUserData } from './services/user.service';
import Header from './Components/Header/Header';


function App() {
    const [appState, setAppState] = useState({
        user: null,
        userData: null,
    });

    const [user, loading, error] = useAuthState(auth);

    if (appState.user !== user) {
        setAppState({ user });
    }

    useEffect(() => {
        if (user === null) return;

        getUserData(user.uid)
            .then(snapshot => {
                if (!snapshot.exists()) {
                    throw new Error('Something went wrong...');
                }

                setAppState({
                    ...appState,
                    userData: snapshot.val()[Object.keys(snapshot.val())[0]],
                });
            })
            .catch(e => {
                alert(e.message);
                console.error(e.message);
            });
    });

    return (
        <>
            <AppContext.Provider value={{...appState, setContext: setAppState}}>
                <BrowserRouter>
                    <Header />
                    <Routes>
                        
                    </Routes>
                </BrowserRouter>
            </AppContext.Provider>
        </>
    );
}

export default App;

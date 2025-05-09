import { useEffect, useState } from 'react';
import './App.css';
import AppContext from './providers/AppContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';
import { getUserData } from './services/user.service';
import Header from './Components/Header/Header';
import AuthGate from './views/AuthGate/AuthGate';
import HomePage from './views/HomePage/HomePage';
import CreatePost from './views/CreatePost/CreatePost';

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

    if (loading) {
        return <div id='loading'><h1>Loading...</h1></div>;
    }

    return (
        <>
            <AppContext.Provider value={{ ...appState, setContext: setAppState }}>
                <BrowserRouter>
                    <Header />
                    <Routes>
                        {!appState.user &&
                            <>
                                <Route path='/auth-gate' element={<AuthGate />} />
                                <Route path='*' element={<HomePage />} />
                            </>
                        }
                        {appState.user &&
                            <>
                                <Route path="/create-post" element={<CreatePost />} />
                                <Route path='*' element={<HomePage />} />
                            </>
                        }
                    </Routes>
                </BrowserRouter>
            </AppContext.Provider>
        </>
    );
}

export default App;

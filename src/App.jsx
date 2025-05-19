import { useEffect, useState } from 'react';
import './App.css';
import AppContext from './providers/AppContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';
import { getUserData } from './services/user.service';
import Header from './Components/Header/Header';
import AuthGate from './views/AuthGate/AuthGate';
import HomePage from './views/HomePage/HomePage';
import CreatePost from './views/CreatePost/CreatePost';
import AllPosts from './views/AllPosts/AllPosts';
import PremierLeague from './views/PremierLeague/PremierLeague';
import FantasyPremierLeague from './views/FantasyPremierLeague/FantasyPremierLeague';
import PostDetails from './views/PostDetails/PostDetails';
import AccountPage from './views/AccountPage/AccountPage';
import Loader from './components/Loader/Loader';
import SearchResults from './views/SearchResults/SearchResults';


function App() {
    const [appState, setAppState] = useState({
        user: null,
        userData: null,
    });

    const [user, loading, error] = useAuthState(auth);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (appState.user !== user) {
            setAppState({ user });
        }
    }, [user]);

    useEffect(() => {
        if (user === null) return;

        getUserData(user.uid)
            .then(snapshot => {
                if (!snapshot.exists()) {
                    throw new Error('Error loading user data...');
                }

                setAppState(prev => ({
                    ...prev,
                    userData: snapshot.val()[Object.keys(snapshot.val())[0]],
                }));
            })
            .catch(e => {
                alert(e.message);
                console.error(e.message);
            });
    }, [user]);

    if (loading) {
        return <Loader />;
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
                                <Route path='/' element={<AllPosts />} />
                                <Route path='/create-post' element={<CreatePost />} />
                                <Route path="/premier-league" element={<PremierLeague />} />
                                <Route path="/fantasy-premier-league" element={<FantasyPremierLeague />} />
                                <Route path="/posts/:postId" element={<PostDetails />} />
                                <Route path='/account' element={<AccountPage />} />
                                <Route path='/account/:userId' element={<AccountPage />} />
                                <Route path='/search/:query' element={<SearchResults />}/>
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

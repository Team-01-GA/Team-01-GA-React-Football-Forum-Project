import { useContext, useEffect, useState } from "react";
import AppContext from "../../providers/AppContext";
import './AccountPage.css';
import { getAllPosts } from "../../services/posts.service";
import PostRow from "../../components/PostRow/PostRow";
import { getUserData, updateUserEmail } from "../../services/user.service";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader/Loader";

function AccountPage() {

    const user = useContext(AppContext);
    const { setContext } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [userToView, setUserToView] = useState(null);
    const [loading, setLoading] = useState(false);

    const { userId } = useParams();
    const currentUserId = userId ? userId : user.user.uid;
    // console.log(user);
    const loggedInUser = userId === user.user.uid;

    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate(`/account/${user.user.uid}`, { replace: true });
        }
    }, [userId, user, navigate]);

    const greetings = [
        'Hey there, ',
        'Nice to see you, ',
        'Hello, ',
        'Greetings, ',
        'Hello again, ',
        'Welcome back, ',
        "Glad you're here, ",
        "It's good to see you, ",
        'Thanks for stopping by, '
    ];

    const [greeting] = useState(() =>
        greetings[Math.floor(Math.random() * greetings.length)]
    );

    const handleEmailChange = async (e) => {
        if (e.key === 'Enter') {
            const normalisedEmail = e.target.value.toLowerCase();

            if (!normalisedEmail || !(normalisedEmail).includes('@') || !(normalisedEmail).includes('.')) {
                return setEmailError('Please enter a valid email address.');
            }

            try {
                await updateUserEmail(user.userData.handle, normalisedEmail);

                setContext(prev => ({
                    ...prev,
                    userData: {
                        ...prev.userData,
                        email: normalisedEmail,
                    },
                }));

                setEditMode(false);
                alert('Email updated succesfully!');
            }
            catch (e) {
                setError(e.message);
            }
        }
    };

    useEffect(() => {
        setLoading(true);
        if (user) {
            const loadPosts = async () => {
                try {
                    const snapshot = await getUserData(currentUserId)
                    if (!snapshot.exists()) {
                        throw new Error('User not found.');
                    }
                    const [ handle ] = Object.entries(snapshot.val())[0];
                    setUserToView(Object.entries(snapshot.val())[0][1]);
                    const result = await getAllPosts();
                    const filtered = result.filter(post => post.author === handle);
                    setPosts(filtered);
                } catch (err) {
                    console.error("Error loading posts:", err);
                    setError("Failed to load posts.");
                }
            };
    
            loadPosts();
            setLoading(false);
        }
    }, [user, currentUserId]);

    if (loading || !userToView || !user || !posts) return <Loader />;

    if (error) setEmailError(error);

    return (
        <div id="acc-wrapper">
            <div id="main-acc-info">
                <div className="acc-img-test"></div>
                {loggedInUser 
                    ? <>
                        <p className="acc-email">{user.userData.email}</p>
                        {!editMode
                            ? <button onClick={() => setEditMode(true)}>Edit</button>
                            : <input placeholder="New Email" type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} onKeyDown={(e) => handleEmailChange(e)}/>
                        }
                        {emailError && <p>{emailError}</p>}
                        <p className="greeting">{greeting}{userToView.firstName} {userToView.lastName}</p>
                    </> 
                    : <>
                        <p className="acc-name">{userToView.handle}</p>
                        {!user.userData.isAdmin
                            ? ''
                            : userToView.isAdmin
                                ? ''
                                : userToView.isBlocked 
                                    ? <button>Unblock User</button>
                                    : <button>Block User</button>
                        }
                    </>
                }
                <div id="acc-details">
                    <p className="acc-detail">{userToView.isAdmin ? 'Admin' : 'User'}</p>
                    <p className="acc-detail">Member since:</p>
                    <p className="acc-detail">Posts:</p>
                    <p className="acc-detail">Comments:</p>
                    <p className="acc-detail">Likes:</p>
                </div>
            </div>
            <div id="acc-content">
                <div className="acc-content-container">
                    {posts.length > 0 ? (
                        posts.map((post) => <PostRow key={post.id} post={post} preview={true} />)
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
                <div className="acc-content-container">
                    
                </div>
            </div>
        </div>
    );
};

export default AccountPage;

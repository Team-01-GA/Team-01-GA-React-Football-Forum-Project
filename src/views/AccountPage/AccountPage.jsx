import { useContext, useEffect, useState } from "react";
import AppContext from "../../providers/AppContext";
import './AccountPage.css';
import { getAllPosts } from "../../services/posts.service";
import PostRow from "../../components/PostRow/PostRow";
import { updateUserEmail } from "../../services/user.service";

function AccountPage() {

    const user = useContext(AppContext);
    const { setContext } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [emailError, setEmailError] = useState(null);

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

    const handleEmailChange = (e) => {
        if (e.key === 'Enter') {
            if (!e.target.value || !(e.target.value).includes('@') || !(e.target.value).includes('.')) {
                return setEmailError('Please enter a valid email address.');
            }

            updateUserEmail(user.userData.handle, e.target.value)
                .then(() => {
                    setContext(prev => ({
                        ...prev,
                        userData: {
                            ...prev.userData,
                            email: e.target.value,
                        },
                    }));
                })
                .catch(e => setError(e.message));

            setEditMode(false);
            alert('Email updated succesfully!');
        }
    };

    useEffect(() => {
        if (user.userData) {
            const loadPosts = async () => {
                try {
                    const result = await getAllPosts();
                    const filtered = result.filter(post => post.author === user.userData.handle);
                    setPosts(filtered);
                } catch (err) {
                    console.error("Error loading posts:", err);
                    setError("Failed to load posts.");
                }
            };
    
            loadPosts();
        }
    }, [user.userData]);

    if (!user.userData) return null;

    if (error) return <p>{error}</p>;

    return (
        <div id="acc-wrapper">
            <div id="main-acc-info">
                <div className="acc-img-test"></div>
                <p className="acc-email">{user.userData.email}</p>
                {!editMode
                    ? <button onClick={() => setEditMode(true)}>Edit</button>
                    : <input placeholder="New Email" type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} onKeyDown={(e) => handleEmailChange(e)}/>
                }
                {emailError && <p>{emailError}</p>}
                <p className="greeting">{greeting}{user.userData.email}</p>
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

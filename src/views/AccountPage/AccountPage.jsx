import { useContext, useEffect, useState } from 'react';
import AppContext from '../../providers/AppContext';
import './AccountPage.css';
import { getAllPosts } from '../../services/posts.service';
import PostRow from '../../components/PostRow/PostRow';
import {
    getProfileImageUrl,
    getUserByHandle,
    getUserData,
    toggleUserBlock,
    updateUserEmail,
} from '../../services/user.service';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import AccountPicture from '../../components/AccountPicture/AccountPicture';

function AccountPage() {
    const user = useContext(AppContext);
    const { setContext } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [userToView, setUserToView] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isUserBlocked, setUserBlocked] = useState(false);
    const [stopButton, setStopButton] = useState(false);
    const [loadingAnim, setLoadingAnim] = useState({
        accButton: false,
        posts: false,
    });
    const [accImgPicker, setAccImgPicker] = useState(false);
    const [accPic, setAccPic] = useState(null);
    const [accDetails, setAccDetails] = useState({
        createdOn: null,
        numberOfPosts: null,
        numberOfComments: null,
        numberOfLikes: null,
    });

    const { userId } = useParams();
    const currentUserId = userId ? userId : user.user.uid;
    const loggedInUser = userId === user.user.uid;

    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate(`/account/${user.user.uid}`, { replace: true });
        }
    }, [userId, user, navigate]);

    useEffect(() => {
        setMessage(false);

        const setUser = async () => {
            try {
                setAccPic(null);
                const snapshot = await getUserData(currentUserId);
                if (!snapshot.exists()) {
                    throw new Error('User not found.');
                }
                const user = Object.entries(snapshot.val())[0][1];
                setUserToView(user);

                setAccDetails({
                    createdOn: user.createdOn
                        ? new Date(user.createdOn).toLocaleDateString()
                        : 'N/A',
                    numberOfPosts: Object.keys(user.posts ?? {}).length,
                    numberOfComments: Object.keys(user.comments ?? {}).length,
                    numberOfLikes: Object.keys(user.likedPosts ?? {}).length,
                });
            } catch (e) {
                console.error('Failed to fetch user', e);
                setMessage('Failed to fetch user.');
            }
        };

        setUser();
    }, [currentUserId]);

    useEffect(() => {
        const getAccPic = async () => {
            if (userToView) {
                try {
                    const url = await getProfileImageUrl(userToView.handle);
                    setAccPic(url);
                } catch (e) {
                    console.error(e.message);
                }
            }
        };

        getAccPic();
    }, [userToView]);

    const greetings = [
        'Hey there, ',
        'Nice to see you, ',
        'Hello, ',
        'Greetings, ',
        'Hello again, ',
        'Welcome back, ',
        "Glad you're here, ",
        "It's good to see you, ",
        'Thanks for stopping by, ',
    ];

    const [greeting] = useState(
        () => greetings[Math.floor(Math.random() * greetings.length)]
    );

    const handleEmailChange = async (e) => {
        if (e.key === 'Enter') {
            setLoadingAnim((prev) => ({ ...prev, accButton: true }));
            setMessage(false);

            const normalisedEmail = e.target.value.toLowerCase();

            if (
                !normalisedEmail ||
                !normalisedEmail.includes('@') ||
                !normalisedEmail.includes('.')
            ) {
                return setMessage('Please enter a valid email address.');
            }

            try {
                await updateUserEmail(user.userData.handle, normalisedEmail);

                setContext((prev) => ({
                    ...prev,
                    userData: {
                        ...prev.userData,
                        email: normalisedEmail,
                    },
                }));

                setEditMode(false);
                setMessage('Email updated succesfully!');
            } catch (e) {
                setMessage(e.message);
            }

            setLoadingAnim((prev) => ({ ...prev, accButton: false }));
        }
    };

    const handleUserBlock = async () => {
        setStopButton(true);
        setMessage(false);
        setLoadingAnim((prev) => ({ ...prev, accButton: true }));
        const newStatus = !isUserBlocked;

        let triesLeft = 2;
        const waitingPeriod = 2500;
        const verifyBlockStatus = async () => {
            if (!triesLeft) {
                throw new Error(
                    'Could not verify that the user is blocked. Refresh the page to check if blocked status was applied.'
                );
            }
            await new Promise((resolve) => setTimeout(resolve, waitingPeriod));

            const snapshot = await getUserByHandle(userToView.handle);
            if (!snapshot.exists()) {
                triesLeft--;
                await verifyBlockStatus();
            }

            const { isBlocked } = snapshot.val();
            if (isBlocked === newStatus) {
                setMessage(
                    newStatus
                        ? 'User blocked successfuly.'
                        : 'User pardoned successfuly.'
                );
                setUserBlocked(newStatus);
                setStopButton(false);
                return;
            } else {
                triesLeft--;
                await verifyBlockStatus();
            }
        };

        try {
            await toggleUserBlock(userToView.handle, newStatus);
            await verifyBlockStatus();
        } catch (e) {
            setMessage(false);
            setMessage(e.message);
        }

        setLoadingAnim((prev) => ({ ...prev, accButton: false }));
    };

    useEffect(() => {
        setLoading(true);
        setMessage(false);

        if (userToView) {
            const loadPosts = async () => {
                try {
                    if (userToView.isBlocked) {
                        setUserBlocked(true);
                    }
                    const result = await getAllPosts();
                    const filtered = result.filter(
                        (post) => post.author === userToView.handle
                    );
                    setPosts(filtered);
                } catch (err) {
                    console.error('Error loading posts:', err);
                    setMessage('Failed to load posts.');
                }
                setLoading(false);
            };

            loadPosts();
        }
    }, [userToView, currentUserId]);

    if (loading || !userToView || !user || !posts) return <Loader />;

    return (
        <div id="acc-wrapper">
            {loggedInUser && accImgPicker && (
                <AccountPicture
                    hideImgPicker={setAccImgPicker}
                    setAccPic={setAccPic}
                />
            )}
            <div id="main-acc-info">
                {accPic ? (
                    <img
                        onClick={() => setAccImgPicker(true)}
                        src={accPic}
                        alt="profile picture"
                        className={`acc-img ${
                            !loggedInUser && 'acc-img-inactive'
                        }`}
                    />
                ) : (
                    <div
                        onClick={() => setAccImgPicker(true)}
                        className={`acc-img-placeholder ${
                            !loggedInUser && 'acc-img-inactive'
                        }`}
                    >
                        <p>?</p>
                    </div>
                )}
                {loggedInUser ? (
                    <>
                        <p className="acc-email">{user.userData.email}</p>
                        {!editMode ? (
                            <button
                                className={
                                    loadingAnim.accButton
                                        ? 'rotating-border-loading'
                                        : ''
                                }
                                onClick={() => setEditMode(true)}
                                disabled={stopButton}
                            >
                                Edit
                            </button>
                        ) : (
                            <input
                                placeholder="New Email"
                                type="email"
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                onKeyDown={(e) => handleEmailChange(e)}
                            />
                        )}
                        {message && <p className="acc-message">{message}</p>}
                        <p className="greeting">
                            {greeting}
                            {userToView.firstName} {userToView.lastName}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="acc-name">{userToView.handle}</p>
                        {!user.userData.isAdmin ? (
                            ''
                        ) : userToView.isAdmin ? (
                            ''
                        ) : (
                            <button
                                id="block-btn"
                                className={
                                    loadingAnim.accButton
                                        ? 'rotating-border-loading'
                                        : ''
                                }
                                onClick={() => handleUserBlock()}
                                disabled={stopButton}
                            >
                                {isUserBlocked ? `Pardon User` : 'Block User'}
                            </button>
                        )}
                        {message && <p className="acc-message">{message}</p>}
                    </>
                )}
                <div id="acc-details">
                    <p className="acc-detail">
                        {userToView.isAdmin ? 'Admin' : 'User'}
                    </p>
                    <p className="acc-detail">Member since: {accDetails.createdOn}</p>
                    <p className="acc-detail">Posts: {accDetails.numberOfPosts}</p>
                    <p className="acc-detail">Comments: {accDetails.numberOfComments}</p>
                    <p className="acc-detail">Likes: {accDetails.numberOfLikes}</p>
                </div>
            </div>
            <div id="acc-content">
                <div className="acc-content-container glassmorphic-bg">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostRow key={post.id} post={post} preview={true} />
                        ))
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
                <div className="acc-content-container glassmorphic-bg"></div>
            </div>
        </div>
    );
}

export default AccountPage;

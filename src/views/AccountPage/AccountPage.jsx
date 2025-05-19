import { useContext, useEffect, useState } from 'react';
import AppContext from '../../providers/AppContext';
import './AccountPage.css';
import { getAllComments, getAllPosts } from '../../services/posts.service';
import PostRow from '../../components/PostRow/PostRow';
import {
    getProfileImageUrl,
    getUserByHandle,
    getUserData,
    toggleUserBlock,
    updateUserEmail,
    updateUserNamePref,
} from '../../services/user.service';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import AccountPicture from '../../components/AccountPicture/AccountPicture';
import CommentRow from '../../components/CommentRow/CommentRow';

function AccountPage() {
    const user = useContext(AppContext);
    const { setContext } = useContext(AppContext);
    const [contentSwitcher, setContentSwitcher] = useState(1);
    const [content, setContent] = useState([]);
    const [contentDelay, toggleContentDelay] = useState(false);
    const [contentSwitcherHighlight, setContentSwitcherHighlight] = useState(1);
    const [message, setMessage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [userPrefersName, setUserPrefersName] = useState(null);
    const [email, setEmail] = useState('');
    const [userToView, setUserToView] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);
    const [isUserBlocked, setUserBlocked] = useState(false);
    const [stopButton, setStopButton] = useState(false);
    const [loadingAnim, setLoadingAnim] = useState({
        accButton: false,
        content: false,
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
        document.title = `${
            userToView
                ? `${userToView.handle} - Accounts - React Fantasy Football Forum`
                : 'Account not found - React Fantasy Footbal Forum'
        }`;
    }, [userToView]);

    useEffect(() => {
        if (!userId) {
            navigate(`/account/${user.user.uid}`, { replace: true });
        }
    }, [userId, user, navigate]);

    useEffect(() => {
        setUserNotFound(false);

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

                setUserPrefersName(user?.prefersFullName ?? false);
                setEmail(user.email);
            } catch (e) {
                console.error('Failed to fetch user', e);
                setUserNotFound(true);
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
                    if (userToView.isBlocked) {
                        setUserBlocked(true);
                    }
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

    const handleUserEdits = async () => {
        setLoadingAnim((prev) => ({ ...prev, accButton: true }));
        setMessage(false);

        const normalisedEmail = email.toLowerCase();
        const namePreference = userPrefersName;

        if (
            (!normalisedEmail ||
            !normalisedEmail.includes('@') ||
            !normalisedEmail.includes('.')) &&
            normalisedEmail !== user.userData.email
        ) {
            return setMessage('Please enter a valid email address.');
        }

        try {
            if (normalisedEmail !== user.userData.email) {
                await updateUserEmail(user.userData.handle, normalisedEmail);
            }
            if (namePreference !== userToView?.prefersFullName) {
                await updateUserNamePref(user.userData.handle, namePreference);
            }

            setContext((prev) => ({
                ...prev,
                userData: {
                    ...prev.userData,
                    email: normalisedEmail,
                    prefersFullName: namePreference,
                },
            }));

            setEditMode(false);
            setMessage('Edits saved.');
        } catch (e) {
            if (e.message.includes('requires-recent-login')) {
                setMessage('You need to be logged in for less than 5 minutes to change your email. Please sign out and log back in.');
                return
            }
        }

        setLoadingAnim((prev) => ({ ...prev, accButton: false }));
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

    const handleContentSwitch = async (content) => {
        setContentSwitcherHighlight(content);
        toggleContentDelay(true);
        setLoadingAnim((prev) => ({ ...prev, content: true }));
        await new Promise((resolve) => setTimeout(resolve, 600));
        setContentSwitcher(content);
    };

    useEffect(() => {
        setMessage(false);

        if (userToView) {
            const loadContent = async () => {
                try {
                    const result = await getAllPosts();
                    let filtered = null;

                    switch (contentSwitcher) {
                        case 1:
                            filtered = result.filter(
                                (post) => post.author === userToView.handle
                            );
                            break;

                        case 2:
                            filtered = await getAllComments(userToView.handle);
                            break;

                        case 3:
                            filtered = result.filter((post) =>
                                post.likedBy.includes(userToView.handle)
                            );
                            break;
                    }

                    setContent(filtered);

                    await new Promise((resolve) => setTimeout(resolve, 300));
                    toggleContentDelay(false);

                    setLoadingAnim((prev) => ({ ...prev, content: false }));
                } catch (e) {
                    console.error('Error loading content:', e);
                    setMessage('Failed to load content.');
                }
            };

            loadContent();
        }
    }, [contentSwitcher, userToView, currentUserId]);

    if (userNotFound) return <h1>User not found.</h1>;

    if (!content || !user || !userToView) return <Loader />;

    return (
        <div id="acc-wrapper">
            <div id='edit-mode-backdrop' className={editMode ? 'editing' : ''} onClick={() => setEditMode(false)}></div>
            {loggedInUser && accImgPicker && (
                <AccountPicture
                    hideImgPicker={setAccImgPicker}
                    setAccPic={setAccPic}
                />
            )}
            <div id="main-acc-info" className={editMode ? 'editing' : ''}>
                {accPic ? (
                    <img
                        onClick={() => editMode ? setAccImgPicker(true) : ''}
                        src={accPic}
                        alt="profile picture"
                        className={`acc-img 
                            ${editMode ? 'editing' : ''}    
                        `}
                    />
                ) : (
                    <div
                        onClick={() => editMode ? setAccImgPicker(true) : ''}
                        className={`acc-img-placeholder  
                            ${editMode ? 'editing' : ''}
                        `}
                    >
                        <p>?</p>
                    </div>
                )}
                {loggedInUser ? (
                    <>
                        {!editMode ? (
                            <>
                                <p className="acc-email">{user.userData.email}</p>
                                <button
                                    id='acc-edit-button'
                                    className={
                                        loadingAnim.accButton
                                            ? 'rotating-border-loading'
                                            : ''
                                    }
                                    onClick={() => setEditMode(true)}
                                    disabled={stopButton}
                                >
                                    Account Settings
                                </button>
                            </>
                        ) : (
                            <input
                                id='email-change'
                                placeholder="New Email"
                                type="email"
                                defaultValue={user.userData.email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        )}
                        {message && <p className="acc-message">{message}</p>}
                        <div className="greeting">
                            {editMode 
                                ? <div id='acc-preferences-wrapper'>
                                    <p>Prefer:</p>
                                    <div className={`acc-preferences ${userPrefersName ? 'active' : ''}`} onClick={() => setUserPrefersName(true)}>
                                        <p>{userToView.firstName} {userToView.lastName}</p>
                                        <span>First, last name</span>
                                    </div>
                                    <div className={`acc-preferences ${!userPrefersName ? 'active' : ''}`} onClick={() => setUserPrefersName(false)}>
                                        <p>{userToView.handle}</p>
                                        <span>Username</span>
                                    </div>
                                </div>
                                : <><p>{greeting}</p><p>{userPrefersName ? `${userToView.firstName} ${userToView.lastName}` : userToView.handle}</p></>
                            }
                        </div>
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
                {editMode && <button className='save-edits-button' onClick={() => handleUserEdits()}>Save changes</button>}
            </div>
                <div id="acc-details">
                    <p className="acc-detail">
                        {userToView.isAdmin ? 'Admin' : 'User'}
                    </p>
                    <p className="acc-detail">
                        Member since: {accDetails.createdOn}
                    </p>
                    <p className="acc-detail">
                        Posts: {accDetails.numberOfPosts}
                    </p>
                    <p className="acc-detail">
                        Comments: {accDetails.numberOfComments}
                    </p>
                    <p className="acc-detail">
                        Likes: {accDetails.numberOfLikes}
                    </p>
                </div>
            <div id="acc-content-switcher">
                <div className="button-container">
                    <button
                        className={`button-highlight
                            ${
                                contentSwitcherHighlight === 1
                                    ? 'highlight-posts'
                                    : ''
                            }
                            ${
                                contentSwitcherHighlight === 2
                                    ? 'highlight-comments'
                                    : ''
                            }
                            ${
                                contentSwitcherHighlight === 3
                                    ? 'highlight-likes'
                                    : ''
                            }`}
                        disabled
                    >
                        {contentSwitcher === 1 && 'Posts'}
                        {contentSwitcher === 2 && 'Comments'}
                        {contentSwitcher === 3 && 'Likes'}
                    </button>
                    <button onClick={() => handleContentSwitch(1)}>
                        Posts
                    </button>
                    <button onClick={() => handleContentSwitch(2)}>
                        Comments
                    </button>
                    <button onClick={() => handleContentSwitch(3)}>
                        Likes
                    </button>
                </div>
            </div>
            <div id="acc-content">
                <div
                    className={`acc-content-container glassmorphic-bg 
                        ${loadingAnim.content ? 'rotating-border-loading' : ''}
                        ${contentDelay ? 'content-loading' : ''}
                    `}
                >
                    {content.length > 0 ? (
                        contentSwitcher === 2 ? (
                            content.map((comment, index) => (
                                <CommentRow
                                    key={index * 23456}
                                    comment={comment}
                                />
                            ))
                        ) : (
                            content.map((post, index) => (
                                <PostRow
                                    key={index * 1234}
                                    post={post}
                                    preview={true}
                                />
                            ))
                        )
                    ) : (
                        <p className="no-acc-content">
                            {contentSwitcher === 1 && 'No posts to load.'}
                            {contentSwitcher === 2 && 'No comments to load.'}
                            {contentSwitcher === 3 && 'No liked posts to load.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountPage;

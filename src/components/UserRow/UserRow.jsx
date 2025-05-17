import { useEffect, useState } from 'react';
import './UserRow.css';
import { useNavigate } from 'react-router-dom';
import { getProfileImageUrl } from '../../services/user.service';

function UserRow({ user }) {

    const [userPic, setUserPic] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const getAccPic = async () => {
                try {
                    const url = await getProfileImageUrl(user.handle);
                    setUserPic(url);
                } catch (e) {
                    console.error(`Failed to get profile picture for user ${user.handle}`, e);
                }
            };
    
            getAccPic();
        }
    }, [user]);

    return (
        <div className='user-row'>
            <p className='user-link-tooltip' onClick={() => navigate(`/account/${user.uid}`)}>Go to user</p>
            {userPic ? (
                <img
                    src={userPic}
                    alt="profile picture"
                    className={'user-img'}
                />
            ) : (
                <div
                    className={'user-img-placeholder'}
                >
                    <p>?</p>
                </div>
            )}
            <p className='user-handle'>{user.handle}</p>
            <div className='user-details'>
                <p className="user-detail">
                        {user.isAdmin ? 'Admin' : 'User'}
                    </p>
                    <p className="user-detail">
                        Member since: {user.createdOn ? new Date(user.createdOn).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="user-detail">
                        Posts: {Object.keys(user.posts ?? {}).length}
                    </p>
                    <p className="user-detail">
                        Comments: {Object.keys(user.comments ?? {}).length}
                    </p>
                    <p className="user-detail">
                        Likes: {Object.keys(user.likedPosts ?? {}).length}
                    </p>
            </div>
        </div>
    );
};

export default UserRow;

import { useNavigate } from 'react-router-dom';
import './PostCard.css';
import { useEffect, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { getUserByHandle } from '../../services/user.service';

export default function PostCard({ post }) {
    const navigate = useNavigate();
    const [authorId, setAuthorId] = useState(null);
    const [prefersName, setPrefersName] = useState(false);
    const [authorFullName, setAuthorFullName] = useState('');

    useEffect(() => {
        if (post) {
            const getAuthorData = async () => {
                try {
                    const snapshot = await getUserByHandle(post.author);

                    if (!snapshot.exists()) {
                        throw new Error(`User not found for postId ${post.id}`);
                    }

                    const user = snapshot.val();

                    setAuthorId(user.uid);
                    setPrefersName(user?.prefersFullName);

                    if (user?.prefersFullName) {
                        setAuthorFullName(`${user?.firstName} ${user?.lastName}`);
                    }

                } catch (e) {
                    console.error('Error getting post author link:', e);
                }
            };

            getAuthorData();
        }
    }, [post]);

    const handleAuthorLink = (e) => {
        e.stopPropagation();
        navigate(`/account/${authorId}`)
    }

    return (
        <div
            className={`post-card`}
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            <p className="post-card-author" onClick={(e) => handleAuthorLink(e)}>
                <strong>By:</strong> {prefersName ? authorFullName : post.author}
            </p>
            <p className="go-to-author">Go to author</p>

            <p className='post-card-title'>{post.title}</p>

            {post?.postImg && <img src={post.postImg} alt='Post image'/>}

            <p className='post-card-content'>
                {`${post.content.slice(0, 50)}...`}
            </p>

            <div className='post-card-details'>
                {post?.category === 'global' && 
                    <p className='post-card-detail'>
                        Global
                    </p>
                }
                <p className='post-card-detail'>
                    Likes: {post?.likes || 0}
                </p>
                <p className='post-card-detail'>
                    Comments: {post?.commentCount || 0}
                </p>
            </div>
                <p className='post-card-date'> 
                    <em>{new Date(post.createdOn).toLocaleString()}</em>
                </p>
            </div>
    );
}

import { useNavigate } from 'react-router-dom';
import './PostRow.css';
import { useEffect, useState } from 'react';
import { getUserByHandle } from '../../services/user.service';

function PostRow({ post }) {
    const [authorId, setAuthorId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (post.id) {
            const getUserId = async () => {
                try {
                    const snapshot = await getUserByHandle(post.author);

                    if (!snapshot.exists()) {
                        throw new Error(`User not found for postId ${post.id}`);
                    }

                    setAuthorId(snapshot.val().uid);
                } catch (e) {
                    console.error('Error getting post author link:', e);
                }
            };

            getUserId();
        }
    }, [post]);

    const handleAuthorLink = (e) => {
        e.stopPropagation();
        navigate(`/account/${authorId}`);
    }

    return (
        <div
            className={`post-row`}
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            <p className='post-row-author' onClick={(e) => handleAuthorLink(e)}>
                <strong>By:</strong> {post.author}
            </p>

            <p className='go-to-author'>Go to author</p>

            <p className='post-row-title'>{post.title}</p>
            {post.category === 'gloabal' && <p className='post-row-detail'>Global</p>}

            <p className='post-row-content'>
                {post.content.length > 200
                    ? `${post.content.slice(0, 200)} ...`
                    : post.content
                }
            </p>

            <div className='post-row-details'>
                <p className='post-row-detail'>Likes: {post.likes}</p>
                <p className='post-row-detail'>Comments: {post.commentCount || 0}</p>
            </div>

            <p className='post-row-date'>{new Date(post.createdOn).toLocaleDateString()}</p>
        </div>
    );
}

export default PostRow;

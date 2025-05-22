import { useNavigate } from 'react-router-dom';
import './PostRow.css';
import { useEffect, useState } from 'react';
import { getUserByHandle } from '../../services/user.service';

function PostRow({ post }) {
    const [authorId, setAuthorId] = useState(null);
    const [prefersName, setPrefersName] = useState(false);
    const [authorNames, setAuthorNames] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (post.id) {
            const getUserData = async () => {
                try {
                    const snapshot = await getUserByHandle(post.author);

                    if (!snapshot.exists()) {
                        throw new Error(`User not found for postId ${post.id}`);
                    }

                    const user = snapshot.val();

                    setAuthorId(user.uid);
                    setPrefersName(user?.prefersFullName);

                    if (user?.prefersFullName) {
                        setAuthorNames(`${user.firstName} ${user.lastName}`)
                    }
                } catch (e) {
                    console.error('Error getting post author link:', e);
                }
            };

            getUserData();
        }
    }, [post]);

    const handleAuthorLink = (e) => {
        e.stopPropagation();
        navigate(`/account/${authorId}`);
    };

    return (
        <div
            className={`post-row`}
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            <div className={post?.postImg ? 'post-row-column' : ''}>
                <p
                    className="post-row-author"
                    onClick={(e) => handleAuthorLink(e)}
                >
                    <strong>By:</strong> {prefersName ? authorNames : post.author}
                </p>

                <p className="go-to-author">Go to author</p>

                <p className="post-row-title">{post.title}</p>

                <p className="post-row-content">
                    {post.content.length > 200
                        ? `${post.content.slice(0, 200)} ...`
                        : post.content}
                </p>

                <div className="post-row-details">
                    {post.category === 'global' && (
                        <p className="post-row-detail">Global</p>
                    )}
                    <p className="post-row-detail">Likes: {post.likes}</p>
                    <p className="post-row-detail">
                        Comments: {post.commentCount || 0}
                    </p>
                </div>
                {!post?.postImg && (
                    <p className="post-row-date">
                        {new Date(post.createdOn).toLocaleDateString()}
                    </p>
                )}
            </div>
            {post?.postImg && (
                <div className="post-row-column">
                    <img src={post.postImg} alt="Post image" />
                    <p className="post-row-date">
                        {new Date(post.createdOn).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
}

export default PostRow;

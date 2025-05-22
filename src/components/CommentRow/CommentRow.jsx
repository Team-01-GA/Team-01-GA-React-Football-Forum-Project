import { useNavigate } from 'react-router-dom';
import './CommentRow.css';
import { useEffect, useState } from 'react';
import { getUserByHandle } from '../../services/user.service';

function CommentRow({ comment }) {

    const navigate = useNavigate();
    const [authorId, setAuthorId] = useState(null);
    const [prefersName, setPrefersName] = useState(false);
    const [authorFullName, setAuthorFullName] = useState('');
    
        useEffect(() => {
            if (comment.commentId) {
                const getAuthorData = async () => {
                    try {
                        const snapshot = await getUserByHandle(comment.author);
    
                        if (!snapshot.exists()) {
                            throw new Error(`Author not found for commentId ${comment.commentId}`);
                        }

                        const user = snapshot.val();
    
                        setAuthorId(user.uid);
                        setPrefersName(user?.prefersFullName);

                        if (user?.prefersFullName) {
                            setAuthorFullName(`${user?.firstName} ${user?.lastName}`);
                        }

                    } catch (e) {
                        console.error('Error getting comment author link:', e);
                    }
                };
    
                getAuthorData();
            }
        }, [comment]);

        const handleAuthorLink = (e) => {
            e.stopPropagation();
            navigate(`/account/${authorId}`);
        };

    return (
        <div className='comment-row'>
            <p className='comment-link-tooltip' onClick={() => navigate(`/posts/${comment.postId}`)}>Go to post</p>
            <p className='comment-author' onClick={(e) => handleAuthorLink(e)}>by <strong>{prefersName ? authorFullName : comment.author}</strong></p>
            <p className='comment-post-title'>{comment.postTitle}</p>
            <p className='comment-content'>{comment.content}</p>
            <p className='comment-row-detail'>Likes: {comment?.likes || 0}</p>
            <p className='comment-date'>{new Date(comment.createdOn).toLocaleDateString()}</p>
        </div>
    );
};

export default CommentRow;

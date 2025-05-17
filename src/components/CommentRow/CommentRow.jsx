import { useNavigate } from 'react-router-dom';
import './CommentRow.css';
import { useEffect, useState } from 'react';
import { getUserByHandle } from '../../services/user.service';

function CommentRow({ comment }) {

    const navigate = useNavigate();
    const [authorId, setAuthorId] = useState(null);
    
        useEffect(() => {
            if (comment.commentId) {
                const getUserId = async () => {
                    try {
                        const snapshot = await getUserByHandle(comment.author);
    
                        if (!snapshot.exists()) {
                            throw new Error(`Author not found for commentId ${comment.commentId}`);
                        }
    
                        setAuthorId(snapshot.val().uid);
                    } catch (e) {
                        console.error('Error getting comment author link:', e);
                    }
                };
    
                getUserId();
            }
        }, [comment]);

    return (
        <div className='comment-row'>
            <p className='comment-link-tooltip' onClick={() => navigate(`/posts/${comment.postId}`)}>Go to post</p>
            <p className='comment-author' onClick={() => navigate(`/account/${authorId}`)}>by <strong>{comment.author}</strong></p>
            <p className='comment-post-title'>{comment.postTitle}</p>
            <p className='comment-content'>{comment.content}</p>
            <p className='comment-date'>{new Date(comment.createdOn).toLocaleDateString()}</p>
        </div>
    );
};

export default CommentRow;

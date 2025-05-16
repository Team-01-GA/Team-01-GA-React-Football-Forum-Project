import { useNavigate } from 'react-router-dom';
import './CommentRow.css';

function CommentRow({ comment }) {

    const navigate = useNavigate();

    return (
        <div className='comment-row'>
            <p className='comment-link-tooltip' onClick={() => navigate(`/posts/${comment.postId}`)}>Go to post</p>
            <p className='comment-post-title'>{comment.postTitle}</p>
            <p className='comment-content'>{comment.content}</p>
            <p className='comment-date'>{new Date(comment.createdOn).toLocaleDateString()}</p>
        </div>
    );
};

export default CommentRow;

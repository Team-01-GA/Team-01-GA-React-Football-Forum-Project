import { useNavigate } from 'react-router-dom';
import './PostRow.css';

function PostRow({ post, preview = false }) {
    const navigate = useNavigate();
  
    return (
      <div
        className={`post-row ${preview ? 'clickable' : ''}`}
        onClick={() => preview && navigate(`/posts/${post.id}`)}
        style={{ cursor: preview ? 'pointer' : 'default' }}
      >
        <h3>{post.title}</h3>
  
        {!preview && (
          <p><strong>By:</strong> {post.author}</p>
        )}
  
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {preview
            ? 'Click to see more ....'
            : post.content}
        </p>
  
        <p><strong>Likes:</strong> {post.likes}</p>
        <p><em>{new Date(post.createdOn).toLocaleString()}</em></p>
      </div>
    );
  }

export default PostRow;

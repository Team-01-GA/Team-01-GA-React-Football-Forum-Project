import { useNavigate } from 'react-router-dom';
import './PostRow.css';
import { useEffect, useState } from 'react';
import { getUserByHandle } from '../../services/user.service';

function PostRow({ post, preview = false }) {

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
                }
                catch (e) {
                    console.error('Error getting post author link:', e);
                }
            }
    
            getUserId();
        }
    }, [post]);
  
    return (
      <div
        className={`post-row ${preview ? 'clickable' : ''}`}
        onClick={() => preview && navigate(`/posts/${post.id}`)}
        style={{ cursor: preview ? 'pointer' : 'default' }}
      >
        <h3>{post.title}</h3>
  
        {!preview && (
          <p onClick={() => navigate(`/account/${authorId}`)}><strong>By:</strong> {post.author}</p>
        )}
  
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {preview
            ? 'Click to see more ....'
            : post.content}
        </p>
  
        <p><strong>Likes:</strong> {post.likes}</p>
        <p><strong>Comments:</strong> {post.commentCount || 0}</p>
        <p><em>{new Date(post.createdOn).toLocaleString()}</em></p>
      </div>
    );
  }

export default PostRow;

import { useNavigate } from "react-router-dom";
import './PostCard.css';
import { useContext, useState } from "react";
import AppContext from "../../providers/AppContext";
import { likePost, unlikePost } from "../../services/posts.service";

export default function PostCard({ post, preview = false }) {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [liked, setLiked] = useState(post.likedBy?.includes(userData.handle));
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);


  const handleLikeClick = async () => {
    if (isLiking) {
      return;
    }
    setIsLiking(true);

    if (userData.isBlocked) {
      alert('Sorry, you are blocked.');
      setIsLiking(false);
      return;
    }

    try {
      if (liked) {
        await unlikePost(userData.handle, post.id);
        setLikeCount((count) => count - 1);
      } else {
        await likePost(userData.handle, post.id);
        setLikeCount((count) => count + 1);
      }
      setLiked(!liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false);
    }
  }


  return (
    <div
      className={`post-card ${preview ? 'clickable' : ''}`}
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

      {preview ? (
        <p><strong>Likes:</strong> {likeCount}</p>
      ) : (
        <button className='post-like-button' onClick={handleLikeClick} disabled={isLiking}>
          {liked ? 'Unlike' : 'Like'}: {likeCount}
        </button>
      )}

      <p><strong>Comments:</strong> {post.commentCount || 0}</p>

      <p><em>{new Date(post.createdOn).toLocaleString()}</em></p>
    </div>
  );
}
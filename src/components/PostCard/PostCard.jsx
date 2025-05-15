import { useNavigate } from "react-router-dom";
import './PostCard.css';
import { useContext, useState } from "react";
import AppContext from "../../providers/AppContext";
import { deletePost, likePost, unlikePost } from "../../services/posts.service";

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


  const handleDeletePost = async () => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    try {
      await deletePost(post.id, post.author);
      alert('Post deleted successfully!');
      navigate(-1, { replace: true });
    } catch (error) {
      alert('Failed to delete post.', error);
    }
  };


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

      {!preview && (
        <div>
          <p><strong>Category:</strong> {post.category.replaceAll('-', ' ')}</p>

          {post.tags && (
            <p>
              <strong>Tags:</strong>{' ['}
              {Object.values(post.tags).join(', ')}
              {']'}
            </p>
          )}
        </div>
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

      {!preview && (userData.isAdmin || userData.handle === post.author) && (
        <button className='post-delete-button' onClick={handleDeletePost}>Delete Post</button>
      )}

    </div>
  );
}
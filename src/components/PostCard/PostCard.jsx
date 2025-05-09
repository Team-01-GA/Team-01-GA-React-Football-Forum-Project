import { useNavigate } from "react-router-dom";
import './PostCard.css';

export default function PostCard({ post }) {
  const navigate = useNavigate();

  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p><strong>By:</strong> {post.author}</p>
      <p>{post.content}</p>
      <p><strong>Likes:</strong> {post.likes}</p>
      <p><em>{new Date(post.createdOn).toLocaleString()}</em></p>
      <button onClick={() => navigate(`/posts/${post.id}`)}>See More</button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../../services/posts.service";
import PostCard from "../../components/PostCard/PostCard";
import { useContext } from "react";
import AppContext from "../../providers/AppContext";
import { addComment } from "../../services/posts.service";
import './PostDetails.css';

export default function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const { userData } = useContext(AppContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        setPost(data);
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;



  const handleAddComment = async () => {
    if (!comment.trim()) {
      return alert('Comment cannot be empty');
    }

    setSubmitting(true);

    try {
      await addComment(postId, userData.handle, comment);
      alert('Comment added successfully');

      // refresh comments
      const updated = await getPostById(postId);
      setPost(updated);

      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className='post-details'>

      <PostCard post={post} />

      <div className='comment-form'>
        <h3>Add a Comment</h3>
        <textarea
          placeholder='Write your comment...'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows='8'
          cols='70'
        />
        <br />
        <button onClick={handleAddComment} disabled={submitting}>
          {submitting ? 'Posting...' : 'Submit Comment'}
        </button>
      </div>


      <div className="comments-header">
        <h3>Comments</h3>
        <button onClick={() => setSortNewestFirst(prev => !prev)}>
          Sort: {sortNewestFirst ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="comments-section">
        {post.comments ? (
          (sortNewestFirst
            ? Object.entries(post.comments).reverse()
            : Object.entries(post.comments)
          )
            .map(([commentId, comment]) => (
              <div key={commentId} className="comment">
                <p><strong>{comment.author}</strong> — {new Date(comment.createdOn).toLocaleString()}</p>
                <p>{comment.content}</p>
                <hr />
              </div>
            ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteComment, getPostById } from '../../services/posts.service';
import PostCard from '../../components/PostCard/PostCard';
import { useContext } from 'react';
import AppContext from '../../providers/AppContext';
import { addComment } from '../../services/posts.service';
import './PostDetails.css';
import Loader from '../../components/Loader/Loader';
import { editPost, editComment } from '../../services/posts.service';
import { getUserByHandle } from '../../services/user.service';
import { likeComment, unlikeComment } from '../../services/posts.service';

export default function PostDetails() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sortCommentType, setSortCommentType] = useState('newest');
    const [isEditing, setIsEditing] = useState(false);
    const [editFields, setEditFields] = useState({
        title: '',
        content: '',
        hasImg: false,
        tags: '',
    });
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [authorId, setAuthorId] = useState(null);
    const [likedComments, setLikedComments] = useState({});

    const { userData } = useContext(AppContext);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${post
            ? `${post.title} - React Fantasy Football Forum`
            : 'Post not found - React Fantasy Football Forum'
            }`;
    }, [post]);

    useEffect(() => {
        if (post) {
            const getUserId = async () => {
                try {
                    const postAuthor = await getUserByHandle(post.author);

                    if (!postAuthor.exists()) {
                        throw new Error(`User not found for postId ${post.id}`);
                    }

                    setAuthorId(postAuthor.val().uid);
                } catch (e) {
                    console.error('Error getting post author link:', e);
                }
            };

            getUserId();
        }
    }, [post]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostById(postId);
                setPost(data);

                setEditFields({
                    title: data.title || '',
                    content: data.content || '',
                    hasImg: !!data?.postImg,
                    tags: Object.values(data.tags || {}).join(', '),
                });

                const initialLikedComments = {};
                if (data.comments) {
                    for (const [id, comment] of Object.entries(data.comments)) {
                        if (comment.likedBy && comment.likedBy[userData.handle]) {
                            initialLikedComments[id] = true;
                        }
                    }
                }
                setLikedComments(initialLikedComments);

            } catch (err) {
                console.error('Failed to load post:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    // if (loading) return <p>Loading...</p>;
    if (loading) return <Loader />;

    // if (!post) {
    //     return <Navigate to="/" replace />;
    // }
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

    const handleDeleteComment = async (commentId) => {
        const confirm = window.confirm(
            'Are you sure you want to delete this comment?'
        );
        if (!confirm) {
            return;
        }

        try {
            await deleteComment(postId, userData.handle, commentId);

            //refresh on delete
            const updated = await getPostById(postId);
            setPost(updated);
            alert('Comment was deleted successfully!');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Could not delete comment.');
        }
    };

    const handleEditPost = async () => {
        const tagsArray = editFields.tags
            .split(', ')
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length <= 32);

        if (tagsArray.length < 3) {
            return alert(
                'Please provide at least three tags, each up to 32 characters.'
            );
        }

        try {
            await editPost(
                postId,
                editFields.title,
                editFields.content,
                editFields.hasImg,
                tagsArray,
                userData.handle,
                userData.isAdmin
            );
            alert('Post updated successfully!');

            const updated = await getPostById(postId);
            setPost(updated);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update post:', err);
            alert('Could not update post.');
        }
    };

    const handleSaveCommentEdit = async (commentId) => {
        try {
            await editComment(
                postId,
                commentId,
                editCommentText,
                userData.handle,
                userData.isAdmin
            );
            const updated = await getPostById(postId);
            setPost(updated);
            setEditingCommentId(null);
            setEditCommentText('');
        } catch (error) {
            console.error('Failed to edit comment:', error);
            alert('Could not edit comment.');
        }
    };

    const handleToggleCommentLike = async (commentId) => {
        const isLiked = likedComments[commentId];

        try {
            if (isLiked) {
                await unlikeComment(post.id, commentId, userData.handle);
            } else {
                await likeComment(post.id, commentId, userData.handle);
            }

            const updated = await getPostById(postId);
            setPost(updated);

            setLikedComments(prev => ({
                ...prev,
                [commentId]: !isLiked,
            }));
        } catch (err) {
            alert('Failed to toggle like');
            console.error(err);
        }
    };

    const handleCommentAuthorLink = async (handle, commentId) => {
        try {
            const snapshot = await getUserByHandle(handle);

            if (!snapshot.exists()) {
                throw new Error(`Author not found for commentId ${commentId}`);
            }

            navigate(`/account/${snapshot.val().uid}`);
        }
        catch (e) {
            console.error('Failed getting link to author: ', e);
        }
    }

    return (
        <div className="post-details">
            {!isEditing && (
                <PostCard
                    post={post}
                    onEditClick={
                        userData.handle === post.author || userData.isAdmin
                            ? () => setIsEditing(true)
                            : null
                    }
                />
            )}

            {isEditing && (
                <div className="edit-form">
                    <label>Title:</label>
                    <input
                        value={editFields.title}
                        onChange={(e) =>
                            setEditFields((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                    />

                    <label>Content:</label>
                    <textarea
                        rows="6"
                        value={editFields.content}
                        onChange={(e) =>
                            setEditFields((prev) => ({
                                ...prev,
                                content: e.target.value,
                            }))
                        }
                    />
                    {editFields.hasImg &&
                        <>
                            <p>Image:</p>
                            <img src={post?.postImg} style={{ width: '100%' }} />
                            <button onClick={() => setEditFields((prev) => ({ ...prev, hasImg: false }))}>Remove image</button>
                        </>
                    }

                    <label>Tags (comma and space separated):</label>
                    <input
                        value={editFields.tags}
                        onChange={(e) =>
                            setEditFields((prev) => ({
                                ...prev,
                                tags: e.target.value,
                            }))
                        }
                    />

                    <button onClick={handleEditPost}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}

            {!userData.isBlocked ? (
                <>
                    <div className="comment-form">
                        <h3>Add a Comment</h3>
                        <textarea
                            placeholder="Write your comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="8"
                            cols="70"
                        />
                        <br />
                        <button
                            onClick={handleAddComment}
                            disabled={submitting}
                        >
                            {submitting ? 'Posting...' : 'Submit Comment'}
                        </button>
                    </div>
                </>
            ) : (
                <p>You are blocked. You can't comment.</p>
            )}

            <div className="comments-header">
                <h3>Comments</h3>
                <select
                    className="comment-sort-select"
                    value={sortCommentType}
                    onChange={(e) => setSortCommentType(e.target.value)}
                >
                    <option value="newest">Sort by Newest</option>
                    <option value="oldest">Sort by Oldest</option>
                    <option value="mostLiked">Sort by Most Likes</option>
                    <option value="leastLiked">Sort by Least Likes</option>
                </select>
            </div>

            <div className="comments-section">
                {post.comments ? (
                    Object.entries(post.comments)
                        .sort(([, a], [, b]) => {
                            switch (sortCommentType) {
                                case 'newest':
                                    return new Date(b.createdOn) - new Date(a.createdOn);
                                case 'oldest':
                                    return new Date(a.createdOn) - new Date(b.createdOn);
                                case 'mostLiked':
                                    return (b.likes || 0) - (a.likes || 0);
                                case 'leastLiked':
                                    return (a.likes || 0) - (b.likes || 0);
                                default:
                                    return 0;
                            }
                        })
                        .map(([commentId, comment]) => (
                            <div key={commentId} className="comment">
                                <div className="comment-header">
                                    <p>
                                        <strong onClick={() => handleCommentAuthorLink(comment.author, commentId)} style={{ cursor: 'pointer' }}>
                                            {comment.author}
                                        </strong>{' '}
                                        — {new Date(comment.createdOn).toLocaleString()}
                                    </p>

                                    <button
                                        className="comment-like-button"
                                        onClick={() => handleToggleCommentLike(commentId)}
                                    >
                                        {likedComments[commentId] ? 'Unlike' : 'Like'}: {comment.likes || 0}
                                    </button>
                                </div>

                                {editingCommentId === commentId ? (
                                    <div className="comment-edit-form">
                                        <textarea
                                            rows="4"
                                            value={editCommentText}
                                            onChange={(e) =>
                                                setEditCommentText(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div className="comment-edit-save-cancel-buttons">
                                            <button
                                                onClick={() =>
                                                    handleSaveCommentEdit(
                                                        commentId
                                                    )
                                                }
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingCommentId(null)
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="comment-content">
                                        {comment.content}
                                    </p>
                                )}

                                <hr />

                                {comment.editedBy && (
                                    <p>
                                        <em>
                                            Edited by: {comment.editedBy.handle}
                                            {comment.editedBy.isAdmin
                                                ? ' (admin)'
                                                : ''}
                                        </em>
                                    </p>
                                )}

                                {(userData.handle === comment.author ||
                                    userData.isAdmin) && (
                                        <div className="comment-edit-save-cancel-buttons">
                                            <button
                                                style={{ backgroundColor: 'red' }}
                                                onClick={() =>
                                                    handleDeleteComment(commentId)
                                                }
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(commentId);
                                                    setEditCommentText(
                                                        comment.content
                                                    );
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>
        </div>
    );
}

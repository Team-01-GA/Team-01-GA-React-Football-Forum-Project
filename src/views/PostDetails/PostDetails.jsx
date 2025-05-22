import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteComment, deletePost, getPostById, likePost, unlikePost } from '../../services/posts.service';
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

    const { userData } = useContext(AppContext);
    const { postId } = useParams();

    const [post, setPost] = useState(null);
    const [editedBy, setEditedBy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState(null);
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
    const [prefersName, setPrefersName] = useState(false);
    const [authorNames, setAuthorNames] = useState('');
    const [authorImage, setAuthorImage] = useState(null);
    const [likedComments, setLikedComments] = useState({});

    const [liked, setLiked] = useState(null);
    const [likeCount, setLikeCount] = useState(null);
    const [isLiking, setIsLiking] = useState(false);

    const [postImg, setPostImg] = useState(null);

    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${post
            ? `${post.title} - React Fantasy Football Forum`
            : 'Post not found - React Fantasy Football Forum'
            }`;
    }, [post]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostById(postId);
                setPost(data);
                setEditedBy(data.editedBy ?? {});
                setPostImg(data.postImg ?? null);

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
    }, [postId, userData]);


    useEffect(() => {
        if (post) {
            const getUserData = async () => {
                try {
                    const snapshot = await getUserByHandle(post.author);

                    if (!snapshot.exists()) {
                        throw new Error(`User not found for postId ${post.id}`);
                    }

                    const user = snapshot.val();

                    setAuthorId(user.uid);
                    setPrefersName(user?.prefersFullName);
                    setAuthorImage(user?.profileImg)

                    if (user?.prefersFullName) {
                        setAuthorNames(`${user?.firstName} ${user?.lastName}`);
                    }

                } catch (e) {
                    console.error('Error getting post author link:', e);
                }
            };

            getUserData();
        }

        if (editedBy && editedBy.handle && !editedBy?.fullName) {
            const getEditorData = async () => {
                try {
                    const snapshot = await getUserByHandle(editedBy.handle);

                    if (!snapshot.exists()) {
                        throw new Error(`Editor not found for postId ${post.id}`);
                    }

                    const editor = snapshot.val()

                    if (editor?.prefersFullName) {
                        setEditedBy(prev => ({...prev, fullName: `${editor.firstName} ${editor.lastName}`}));
                    } else {
                        setEditedBy(prev => ({...prev, fullName: null}));
                    }

                } catch (e) {
                    console.error('Error getting editor:', e);
                }
            };

            getEditorData();
        }
    }, [post, editedBy]);

    useEffect(() => {
        if (post && userData) {
            setLiked(post.likedBy?.includes(userData.handle));
            setLikeCount(post.likes || 0);
        }
    }, [post, userData]);

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
                setLiked(!liked);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDeletePost = async (e) => {
        e.stopPropagation();

        try {
            await deletePost(post.id, post.author);
            alert('Post deleted successfully!');
            navigate(-1, { replace: true });
        } catch (error) {
            alert('Failed to delete post.', error);
        }
    };        

    return (
        <div className="post-details">
            {isDeleting && <div id='delete-confirmation' onClick={() => setIsDeleting(false)}>
                <div className='glassmorphic-bg'>
                    <h1>Are you sure you want to delete this post?</h1>
                    <button onClick={(e) => handleDeletePost(e)}>Delete</button>
                </div>
            </div>}
            <div className={`editing-backdrop ${isEditing ? 'editing' : ''}`} onClick={() => setIsEditing(false)}></div>
            <div id='post-details-main' className={`glassmorphic-bg ${isEditing ? 'editing' : ''}`}>
            {!isEditing
                ?  <>
                    {authorImage 
                        ? <img className='post-details-author-img' src={authorImage} alt='Author image'/> 
                        : <div className='post-details-author-placeholder'><p>?</p></div>
                    }
                    <p className='post-details-author' onClick={() => navigate(`/account/${authorId}`)}>{prefersName ? authorNames : post.author}</p>
                    <p className='post-details-date'>{new Date(post.createdOn).toLocaleDateString()}</p>
                    <p className='post-details-title'>{post.title}</p>

                    {postImg && <img src={postImg} alt='Post image'/>}

                    <div className='post-details-content'>
                        <p>{post.content}</p>
                    </div>

                    <div className='post-details-details'>
                        {editedBy.handle && <p className='post-details-detail'>Edited by: {editedBy?.isAdmin ? 'Admin' : editedBy?.fullName ? editedBy?.fullName : editedBy?.handle}</p>}
                        <p className='post-details-detail'>{post.category.replaceAll('-', ' ')}</p>
                        <p className={`post-details-detail likes ${liked ? 'liked' : ''}`} onClick={handleLikeClick} disabled={isLiking}>{liked ? 'Unlike:' : 'Like:'} {likeCount}</p>
                        <p className='post-details-detail'>Comments: {post?.commentCount || 0}</p>
                    </div>

                    <p className="tags">
                        {Object.values(post.tags).map((tag) => (
                            <span
                                key={tag}
                                className="clickable-tag"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/search/${ tag }`);
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </p>
                    {(userData.isAdmin || userData.handle === post.author) &&
                        <div className='post-details-actions'>
                            <i className="fa-solid fa-ellipsis"></i>
                            <div className='action-buttons'>
                                <button className='post-action-button' onClick={() => setIsDeleting(true)}><i className='fa-solid fa-trash-can'></i></button>
                                <button className='post-action-button' onClick={() => setIsEditing(true)}><i className='fa-solid fa-pen-to-square'></i></button>
                            </div>
                        </div>
                    }
                </>
                : <>
                    {authorImage 
                        ? <img className='post-details-author-img' src={authorImage} alt='Author image'/> 
                        : <div className='post-details-author-placeholder'><p>?</p></div>
                    }
                    <p className='post-details-author' onClick={() => navigate(`/account/${authorId}`)}>{prefersName ? authorNames : post.author}</p>

                    <input value={editFields.title} onChange={(e) => setEditFields((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))}/>

                    {editFields.hasImg && 
                        <div className='edit-img'>
                            <img src={postImg}/>
                            <button className='remove-image' onClick={() => setEditFields((prev) => ({...prev, hasImg: false}))}>Remove image</button>
                        </div>
                    }

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
                    <input
                        value={editFields.tags}
                        onChange={(e) =>
                            setEditFields((prev) => ({
                                ...prev,
                                tags: e.target.value,
                            }))
                        }
                    />

                    <div className='post-edit-actions'>
                        <button onClick={handleEditPost}>Save</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </>
            }
            </div>

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

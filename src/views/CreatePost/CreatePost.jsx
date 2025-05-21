import { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { addPost, uploadPostImage } from '../../services/posts.service';
import './CreatePost.css';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
    const [fields, setFields] = useState({
        title: '',
        content: '',
        category: 'global',
        tags: '',
    });
    const [fieldError, setFieldError] = useState({
        title: null,
        content: null,
        tags: null,
    })
    const [category, setCategory] = useState(1);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [postId, setPostId] = useState(null);

    const { userData } = useContext(AppContext);

    const navigate = useNavigate();

    const fileInputRef = useRef();

    useEffect(() => {
        document.title = 'Create Post - React Fantasy Football Forum';
    }, []);

    const handleUpdateValue = (key, value) => {
        setFields({
            ...fields,
            [key]: value,
        });
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleClick = () => fileInputRef.current.click();

    const handleUploadFile = async (postId) => {
        if (selectedFile) {
            try {
                await uploadPostImage(postId, selectedFile);
            } catch (e) {
                console.error(e.message);
            }
        }
    };

    const handleRemove = (e) => {
        e ? e.stopPropagation() : null;
        setSelectedFile(null);
        setPreviewUrl(null);
        fileInputRef.current.value = null;
    };

    const handleCategorySwitch = (categoryNum) => {
        let category = null;
        setCategory(categoryNum);
        switch (categoryNum) {
            case 1:
                category = 'global';
                break;
            case 2:
                category = 'premier-league';
                break;
            case 3:
                category = 'fantasy-premier-league';
                break;

            default:
                category = 'global';
        }
        setFields((prev) => ({ ...prev, category: category }));
    };

    const handleFieldError = async (field, message) => {
        setFieldError(prev => ({...prev, [field]: message}));
        await new Promise(resolve => setTimeout(resolve, 6000));
        setFieldError(prev => ({...prev, [field]: null}));
    }

    const handleCreatePost = async () => {
        let hasError = null;
        if (!fields.title) {
            handleFieldError('title', 'Please provide a title.');
            hasError = true;
        }

        if (!fields.content) {
            handleFieldError('content', 'Please provide a body.');
            hasError = true;
        }

        if (fields.title.length < 16 || fields.title.length > 64) {
            handleFieldError('title', 'Title must be between 16 and 64 symbols.');
            hasError = true;
        }

        if (fields.content.length < 32 || fields.content.length > 8192) {
            handleFieldError('content', 'Text content must be between 32 and 8192 symbols.');
            hasError = true;
        }

        const tagsArray = fields.tags
            .split(', ')
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag && tag.length <= 32);

        if (tagsArray.length < 3) {
            handleFieldError('tags', 'Please provie at least three tags, each up to 32 symbols, seperated by a comma and a space.');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            const postId = await addPost(
                userData.handle,
                fields.title,
                fields.content,
                fields.category,
                tagsArray
            );
            handleUploadFile(postId);
            setPostId(postId);
            setFields({ title: '', content: '', category: '', tags: '' });
            handleRemove();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    const goToPost = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postId}`);
    };

    if (userData?.isBlocked) {
        return (
            <div id="user-blocked" className="glassmorphic-bg">
                You are blocked. You cannot post.
            </div>
        );
    }

    return (
        <div id="create-post-wrapper">
            {postId && (
                <div id="post-created-backdrop" onClick={() => setPostId(null)}>
                    <div id="post-created" className="glassmorphic-bg">
                        <h1>Post created successfully!</h1>
                        <button onClick={(e) => goToPost(e)}>Go to post</button>
                    </div>
                </div>
            )}
            <h1 id="create-post-heading">Create Post</h1>

            <div id="create-post-form" className="glassmorphic-bg">
                <div className="create-post-title">
                    <label htmlFor="title">Title: </label>
                    {fieldError.title && <p className='field-error'>{fieldError.title}</p>}
                    <input
                        value={fields.title}
                        onChange={(e) =>
                            handleUpdateValue('title', e.target.value)
                        }
                        type="text"
                        name="title"
                        id="title"
                    />
                </div>
                <div className="create-post-category">
                    <p>Category: </p>
                    <div className="category-switch-wrapper">
                        <button
                            className={`category-switch ${
                                category === 1 ? 'category-active' : ''
                            }`}
                            onClick={() => handleCategorySwitch(1)}
                        >
                            Global
                        </button>
                        <button
                            className={`category-switch ${
                                category === 2 ? 'category-active' : ''
                            }`}
                            onClick={() => handleCategorySwitch(2)}
                        >
                            Premier League
                        </button>
                        <button
                            className={`category-switch ${
                                category === 3 ? 'category-active' : ''
                            }`}
                            onClick={() => handleCategorySwitch(3)}
                        >
                            Fantasy Premier League
                        </button>
                    </div>
                </div>
                <div className="create-post-content">
                    <label htmlFor="content">Content: </label>
                    {fieldError.content && <p className='field-error'>{fieldError.content}</p>}
                    <textarea
                        value={fields.content}
                        onChange={(e) =>
                            handleUpdateValue('content', e.target.value)
                        }
                        name="content"
                        id="content"
                        cols="30"
                        rows="10"
                    />
                </div>

                <div className="create-post-image">
                    <div
                        className="drop-area"
                        onClick={handleClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => handleFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        {!previewUrl ? (
                            <p>Click or drag an image here</p>
                        ) : (
                            <div className="preview-container">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="preview-image"
                                />
                            </div>
                        )}
                        {previewUrl && (
                            <>
                                <button
                                    onClick={(e) => handleRemove(e)}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="create-post-tags">
                    <label htmlFor="tags">Tags:</label>
                    {fieldError.tags && <p className='field-error'>{fieldError.tags}</p>}
                    <input
                        type="text"
                        name="tags"
                        id="tags"
                        placeholder="Enter tags, separated by commas and a space. (Tags character limit: 32)"
                        value={fields.tags}
                        onChange={(e) =>
                            handleUpdateValue('tags', e.target.value)
                        }
                    />
                </div>

                <button
                    className="create-post-submit"
                    onClick={handleCreatePost}
                >
                    Create
                </button>
            </div>
        </div>
    );
}

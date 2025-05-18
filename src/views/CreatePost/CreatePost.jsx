import { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../../providers/AppContext';
import { addPost, uploadPostImage } from '../../services/posts.service';

export default function CreatePost() {
    const [fields, setFields] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const { userData } = useContext(AppContext);

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

    const handleUploadFile = async (postId) => {
        if (selectedFile) {
            try {
                await uploadPostImage(postId, selectedFile);
            } catch (e) {
                console.error(e.message);
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        fileInputRef.current.value = null;
    };

    const handleCreatePost = async () => {
        if (!fields.title || !fields.content) {
            return alert('Please fill in all fields');
        }

        if (fields.title.length < 16 || fields.title.length > 64) {
            return alert('Title must be between 16 and 64 symbols.');
        }

        if (fields.content.length < 32 || fields.content.length > 8192) {
            return alert('Text content must be between 32 and 8192 symbols.');
        }

        if (!fields.category) {
            return alert('Please select a category');
        }

        const tagsArray = fields.tags
            .split(', ')
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag && tag.length <= 32);

        if (tagsArray.length < 3) {
            return alert(
                'Please provie at least three tags, each up to 32 symbols'
            );
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
            setFields({ title: '', content: '', category: '', tags: '' });
            handleRemoveFile();
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    if (userData.isBlocked) {
        return <p>You are blocked. You cannot post.</p>;
    }

    return (
        <>
            <h2>Create Post</h2>

            <label htmlFor="title">Title: </label>
            <input
                value={fields.title}
                onChange={(e) => handleUpdateValue('title', e.target.value)}
                type="text"
                name="title"
                id="title"
            />
            <br />
            <br />

            <label htmlFor="category">Category: </label>
            <select
                name="category"
                id="category"
                value={fields.category}
                onChange={(e) => handleUpdateValue('category', e.target.value)}
            >
                <option value="">Select category</option>
                <option value="premier-league">Premier League</option>
                <option value="fantasy-premier-league">
                    Fantasy Premier League
                </option>
            </select>
            <br />
            <br />

            <label htmlFor="content">Content: </label>
            <textarea
                value={fields.content}
                onChange={(e) => handleUpdateValue('content', e.target.value)}
                name="content"
                id="content"
                cols="30"
                rows="10"
            />
            <br />
            <br />

            <label htmlFor="image">Image: </label>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files[0])}
            />
            {previewUrl && <img src={previewUrl} style={{ width: '20%' }} />}
            {selectedFile && <button onClick={() => handleRemoveFile()}>Remove file</button>}
            <br />
            <br />

            <label htmlFor="tags">Tags:</label>
            <input
                type="text"
                name="tags"
                id="tags"
                placeholder="Enter tags, separated by commas and a space. (Tags character limit: 32)"
                value={fields.tags}
                onChange={(e) => handleUpdateValue('tags', e.target.value)}
            />
            <br />
            <br />

            <button onClick={handleCreatePost}>Create</button>
        </>
    );
}

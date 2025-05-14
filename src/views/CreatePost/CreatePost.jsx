import { useContext, useState } from "react";
import AppContext from '../../providers/AppContext';
import { addPost } from '../../services/posts.service';


export default function CreatePost() {

    const [fields, setFields] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
    });

    const { userData } = useContext(AppContext)

    const handleUpdateValue = (key, value) => {
        setFields({
            ...fields,
            [key]: value
        });
    }

    const handleCreatePost = async () => {
        if (!fields.title || !fields.content) {
            return alert('Please fill in all fields');
        }

        if (fields.title.length < 16 || fields.title.length > 64) {
            return alert('Title must be between 16 and 64 symbols.')
        }

        if (fields.content.length < 32 || fields.content.length > 8192) {
            return alert('Text content must be between 32 and 8192 symbols.')
        }

        if (!fields.category) {
            return alert('Please select a category');
        }

        const tagsArray = fields.tags
            .split(', ')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag && tag.length <= 32);

        if(tagsArray.length < 3){
            return alert('Please provie at least three tags, each up to 32 symbols');
        }

        try {
            await addPost(userData.handle, fields.title, fields.content, fields.category, tagsArray);
            setFields({ title: '', content: '', category: '', tags: '' });
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    }

    if (userData.isBlocked) {
        return <p>You are blocked. You cannot post.</p>;
    }

    return (
        <>
            <h2>Create Post</h2>

            <label htmlFor="title">Title: </label>
            <input
                value={fields.title}
                onChange={e => handleUpdateValue('title', e.target.value)}
                type="text"
                name="title"
                id="title"
            />
            <br /><br />

            <label htmlFor="category">Category: </label>
            <select
                name="category"
                id="category"
                value={fields.category}
                onChange={e => handleUpdateValue('category', e.target.value)}
            >
                <option value="">Select category</option>
                <option value="premier-league">Premier League</option>
                <option value="fantasy-premier-league">Fantasy Premier League</option>
            </select>
            <br /><br />

            <label htmlFor="content">Content: </label>
            <textarea
                value={fields.content}
                onChange={e => handleUpdateValue('content', e.target.value)}
                name="content"
                id="content"
                cols="30"
                rows="10"
            />
            <br /><br />

            <label htmlFor="tags">Tags:</label>
            <input
                type='text'
                name='tags'
                id='tags'
                placeholder='Enter tags, separated by commas and a space. (Tags character limit: 32)'
                value={fields.tags}
                onChange={(e) => handleUpdateValue('tags', e.target.value)}
            />
            <br /><br />

            <button onClick={handleCreatePost}>Create</button>
        </>
    );
}
import { useContext, useState } from "react";
import AppContext from '../../providers/AppContext';
import { addPost } from '../../services/posts.service';


export default function CreatePost() {

    const [fields, setFields] = useState({
        title: '',
        content: ''
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

        if (fields.title.length < 16 || fields.title.length > 64){
            return alert('Title must be between 16 and 64 symbols.')
        }

        if(fields.content.length < 32 || fields.content.length > 8192){
            return alert('Text content must be between 32 and 8192 symbols.')
        }

        try {
            await addPost(userData.handle, fields.title, fields.content);
            setFields({ title: '', content: '' });
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    }

    return (
        <>
            <h2>Create Post</h2>
            <label htmlFor="title">Title: </label>
            <input value={fields.title} onChange={e => handleUpdateValue('title', e.target.value)} type="text" name="title" id="title" /> <br /> <br />
            <label htmlFor="content">Content: </label>
            <textarea value={fields.content} onChange={e => handleUpdateValue('content', e.target.value)} name="content" id="content" cols="30" rows="10"></textarea> <br /> <br />
            <button onClick={handleCreatePost}>Create</button>
        </>
    );
}
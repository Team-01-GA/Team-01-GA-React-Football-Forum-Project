import { useEffect, useState } from 'react';
import './HomePage.css';
import { getAllPosts } from '../../services/posts.service';
import { getAllUsers } from '../../services/user.service';
import Loader from '../../components/Loader/Loader';
import PostRow from '../../components/PostRow/PostRow';

function HomePage() {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const loadForumData = async () => {
            try {
                const users = await getAllUsers();
                setUsers(users);

                const posts = await getAllPosts();
                setPosts(posts);
            }
            catch (e) {
                console.error('Error loading forum data:', e);
            }
        }

        loadForumData();
        setLoading(false);
    }, []);

    if (loading) return <Loader />;

    return (
        <div id="homepage">
            <h1>Welcome to the React Fantasy Football Forum!</h1>
            <div id='forum-details'>
                <p className="forum-detail">
                    Users: {users.length}
                </p>
                <p className="forum-detail">
                    Posts: {posts.length}
                </p>
            </div>
            <div id='forum-content'>
                <p className='forum-content-title'>10 most recent posts</p>
                <p className='forum-content-title'>10 most commented posts</p>
                <div className='forum-content-container glassmorphic-bg'>
                    {posts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn)).map((post, index) => {
                        return <PostRow key={index*2534} post={post} preview={true} />
                    }).slice(0, 10)}
                </div>
                <div className='forum-content-container glassmorphic-bg'>
                    {posts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0)).map((post, index) => {
                        return <PostRow key={index*1234} post={post} preview={true} />
                    }).slice(0, 10)}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

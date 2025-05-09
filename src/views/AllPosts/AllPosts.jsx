import { useState, useEffect } from "react";
import { getAllPosts } from "../../services/posts.service";
import PostCard from "../../components/PostCard/PostCard";
import './AllPosts.css';

export default function AllPosts() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const result = await getAllPosts();
                setPosts(result);
            } catch (err) {
                console.error("Error loading posts:", err);
                setError("Failed to load posts.");
            }
        };

        loadPosts();
    }, []);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2 id="all-posts-heading">All Posts</h2>

            <div className="post-list">
                {posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </div>
    );
}

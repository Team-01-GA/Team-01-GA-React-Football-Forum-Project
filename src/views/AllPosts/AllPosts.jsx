import { useState, useEffect } from "react";
import { getAllPosts } from "../../services/posts.service";
import PostCard from "../../components/PostCard/PostCard";
import './AllPosts.css';

export default function AllPosts({ category = null }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const result = await getAllPosts();
                const filtered = category
                    ? result.filter(post => post.category === category)
                    : result;
                setPosts(filtered);
            } catch (err) {
                console.error("Error loading posts:", err);
                setError("Failed to load posts.");
            }
        };

        loadPosts();
    }, [category]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2 id="all-posts-heading">
                {category === "premier-league" && "Premier League"}
                {category === "fantasy-premier-league" && "Fantasy Premier League"}
                {!category && "All Posts"}
            </h2>

            <div className="post-list">
                {posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post.id} post={post} preview={true} />)
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </div>
    );
}

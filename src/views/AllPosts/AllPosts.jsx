import { useState, useEffect } from "react";
import { getAllPosts } from "../../services/posts.service";
import PostCard from "../../components/PostCard/PostCard";
import './AllPosts.css';
import PostRow from "../../components/PostRow/PostRow";

export default function AllPosts({ category = null }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [useRowView, setUseRowView] = useState(false);
    const [sortBy, setSortBy] = useState('date-desc');

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

    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === 'likes-desc') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'likes-asc') return (a.likes || 0) - (b.likes || 0);

        if (sortBy === 'comments-desc') return (b.commentCount || 0) - (a.commentCount || 0);
        if (sortBy === 'comments-asc') return (a.commentCount || 0) - (b.commentCount || 0);

        if (sortBy === 'date-desc') return new Date(b.createdOn) - new Date(a.createdOn);
        if (sortBy === 'date-asc') return new Date(a.createdOn) - new Date(b.createdOn);

        return 0;
    });

    return (
        <div>
            <h2 id="all-posts-heading">
                {category === "premier-league" && "Premier League"}
                {category === "fantasy-premier-league" && "Fantasy Premier League"}
                {!category && "All Posts"}
            </h2>

            <button onClick={() => setUseRowView(prev => !prev)}>
                Change to:<br />{useRowView ? 'Card' : 'Row'}
            </button>


            <label htmlFor="sort-select">Sort by:</label>
            <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>

                <option value="likes-desc">Likes (Most First)</option>
                <option value="likes-asc">Likes (Least First)</option>

                <option value="comments-desc">Comments (Most First)</option>
                <option value="comments-asc">Comments (Least First)</option>
            </select>


            <div className={`post-list ${useRowView ? 'row-view' : 'card-view'}`}>
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) =>
                        useRowView
                            ? <PostRow key={post.id} post={post} preview={true} />
                            : <PostCard key={post.id} post={post} preview={true} />)
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </div>
    );
}

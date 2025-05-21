import { useState, useEffect } from 'react';
import { getAllPosts } from '../../services/posts.service';
import PostCard from '../../components/PostCard/PostCard';
import './AllPosts.css';
import PostRow from '../../components/PostRow/PostRow';
import Select from 'react-select';

const sortOptions = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'likes-desc', label: 'Likes (Most First)' },
    { value: 'likes-asc', label: 'Likes (Least First)' },
    { value: 'comments-desc', label: 'Comments (Most First)' },
    { value: 'comments-asc', label: 'Comments (Least First)' },
];

const sorting = {
    'date-desc': (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
    'date-asc': (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
    'likes-desc': (a, b) => (b.likes || 0) - (a.likes || 0),
    'likes-asc': (a, b) => (a.likes || 0) - (b.likes || 0),
    'comments-desc': (a, b) => (b.commentCount || 0) - (a.commentCount || 0),
    'comments-asc': (a, b) => (a.commentCount || 0) - (b.commentCount || 0),
};

const filterOptions = [
    {value: 'none', label: 'None'},
    {value: 'hasImg', label: 'Has image'},
    {value: 'noImg', label: 'No image'},
    {value: 'noEngagement', label: 'No engagement yet'},
]

const filter = {
    'none': () => true,
    'hasImg': (post) => !!post?.postImg,
    'noImg': (post) => !post?.postImg,
    'noEngagement': (post) => !post?.commentCount && !post?.likes
}

const selectStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: 'rgb(236, 236, 236)',
        borderRadius: '15px',
        border: 'none',
        transition: 'all 0.3s ease',
        padding: '0px 10px',
        fontSize: '1.2em',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'black',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'black',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'rgb(225, 218, 218)',
        color: 'black',
        marginLeft: '20px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
            ? 'rgb(194, 186, 186)'
            : state.isSelected
            ? 'rgb(194, 186, 186)'
            : 'transparent',
        color: 'black',
        padding: 10,
    }),
};

export default function AllPosts({ category = null }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [useRowView, setUseRowView] = useState(true);
    const [sortBy, setSortBy] = useState(sortOptions[0]);
    const [filterBy, setFilterBy] = useState(filterOptions[0]);

    useEffect(() => {
        document.title = 'All Posts - React Fantasy Football Forum';
    }, []);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const result = await getAllPosts();
                const filtered = category
                    ? result.filter(
                          (post) =>
                              post.category === category ||
                              post.category === 'global'
                      )
                    : result;
                setPosts(filtered);
            } catch (err) {
                console.error('Error loading posts:', err);
                setError('Failed to load posts.');
            }
        };

        loadPosts();
    }, [category]);

    if (error) return <p>{error}</p>;

    const filteredSortedPosts = [...posts].filter(filter[filterBy.value]).sort(sorting[sortBy.value]);

    return (
        <>
            <h1 id="all-posts-heading">
                {category === 'premier-league' && 'Premier League'}
                {category === 'fantasy-premier-league' &&
                    'Fantasy Premier League'}
                {!category && 'All Posts'}
            </h1>
            <div id="all-posts-wrapper" className="glassmorphic-bg">
                <div id="all-posts-options">
                    <Select
                        options={sortOptions}
                        value={sortBy}
                        styles={selectStyles}
                        onChange={(selected) => setSortBy(selected)}
                        isSearchable={false}
                        aria-label="Sort posts"
                    />
                    <Select
                        options={filterOptions}
                        value={filterBy}
                        styles={selectStyles}
                        onChange={(selected) => setFilterBy(selected)}
                        isSearchable={false}
                        aria-label="Sort posts"
                    />
                    <div id="view-switcher">
                        <div className="button-container">
                            <button onClick={() => setUseRowView(true)}>
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <button onClick={() => setUseRowView(false)}>
                                <i className="fa-solid fa-table-cells-large"></i>
                            </button>
                            <button
                                className={`button-highlight
                                    ${
                                        useRowView
                                            ? 'highlight-row'
                                            : 'highlight-card'
                                    }
                                `}
                                disabled
                            >
                                {useRowView ? (
                                    <i className="fa-solid fa-bars"></i>
                                ) : (
                                    <i className="fa-solid fa-table-cells-large"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`post-list ${
                        useRowView ? 'row-view' : 'card-view'
                    }`}
                >
                    {filteredSortedPosts.length > 0 ? (
                        filteredSortedPosts.map((post) =>
                            useRowView ? (
                                <PostRow
                                    key={post.id}
                                    post={post}
                                />
                            ) : (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    preview={true}
                                />
                            )
                        )
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
            </div>
        </>
    );
}

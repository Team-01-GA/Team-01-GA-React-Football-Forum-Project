import { useParams } from 'react-router-dom';
import './SearchResults.css';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader/Loader';
import { getAllComments, getAllPosts } from '../../services/posts.service';
import { getAllUsers } from '../../services/user.service';
import CommentRow from '../../components/CommentRow/CommentRow';
import UserRow from '../../components/UserRow/UserRow';
import PostRow from '../../components/PostRow/PostRow';
import Select from 'react-select';

function SearchResults() {
    const { query: rawQuery } = useParams();

    const [query, setQuery] = useState(null);
    const [contentSwitcherHighlight, setContentSwitcherHighlight] = useState(1);
    const [contentSwitcher, setContentSwitcher] = useState(1);
    const [loadingAnim, setLoadingAnim] = useState(false);
    const [contentDelay, toggleContentDelay] = useState(false);
    const [content, setContent] = useState([]);
    const [sortOptions, setSortOptions] = useState([
        { value: 'date-desc', label: 'Newest first' },
        { value: 'date-asc', label: 'Oldest first' },
        { value: 'likes-desc', label: 'Most likes' },
        { value: 'likes-asc', label: 'Least likes' },
        { value: 'comments-desc', label: 'Most comments' },
        { value: 'comments-asc', label: 'Least comments' },
    ]);
    const [sortBy, setSortBy] = useState({ value: 'date-desc', label: 'Newest first' });

    useEffect(() => {
        setQuery(decodeURIComponent(rawQuery));
    }, [rawQuery]);

    useEffect(() => {
        if (query) {
            document.title = `Search Results For "${query}" - React Fantasy Football Forum`;
        }
    }, [query]);

    const handleContentSwitch = async (content) => {
        setContentSwitcherHighlight(content);
        toggleContentDelay(true);
        setLoadingAnim(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setContentSwitcher(content);
    };

    const sortConfig = {
        1: {
            options: [
                { value: 'date-desc', label: 'Newest first' },
                { value: 'date-asc', label: 'Oldest first' },
                { value: 'likes-desc', label: 'Most likes' },
                { value: 'likes-asc', label: 'Least likes' },
                { value: 'comments-desc', label: 'Most comments' },
                { value: 'comments-asc', label: 'Least comments' },
            ],
            sorting: {
                'date-desc': (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
                'date-asc': (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
                'likes-desc': (a, b) => (b.likes || 0) - (a.likes || 0),
                'likes-asc': (a, b) => (a.likes || 0) - (b.likes || 0),
                'comments-desc': (a, b) => (b.commentCount || 0) - (a.commentCount || 0),
                'comments-asc': (a, b) => (a.commentCount || 0) - (b.commentCount || 0),
            },
        },
        2: {
            options: [
                { value: 'posts-desc', label: 'Most posts' },
                { value: 'posts-asc', label: 'Least posts' },
                { value: 'likes-desc', label: 'Most likes' },
                { value: 'likes-asc', label: 'Least likes' },
                { value: 'comments-desc', label: 'Most comments' },
                { value: 'comments-asc', label: 'Least comments' },
            ],
            sorting: {
                'posts-desc': (a, b) => Object.keys(b.posts || {}).length - Object.keys(a.posts || {}).length,
                'posts-asc': (a, b) => Object.keys(a.posts || {}).length - Object.keys(b.posts || {}).length,
                'likes-desc': (a, b) => Object.keys(b.likedPosts || {}).length - Object.keys(a.likedPosts || {}).length,
                'likes-asc': (a, b) => Object.keys(a.likedPosts || {}).length - Object.keys(b.likedPosts || {}).length,
                'comments-desc': (a, b) => Object.keys(b.comments || {}).length - Object.keys(a.comments || {}).length,
                'comments-asc': (a, b) => Object.keys(a.comments || {}).length - Object.keys(b.comments || {}).length,
            },
        },
        3: {
            options: [
                { value: 'date-desc', label: 'Newest first' },
                { value: 'date-asc', label: 'Oldest first' },
                { value: 'likes-desc', label: 'Most likes' },
                { value: 'likes-asc', label: 'Least likes' },
            ],
            sorting: {
                'date-desc': (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
                'date-asc': (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
                'likes-desc': (a, b) => (b.likes || 0) - (a.likes || 0),
                'likes-asc': (a, b) => (a.likes || 0) - (b.likes || 0),
            },
        },
    };

    const defaultSorting = {
        1: 'date-desc',
        2: 'posts-desc',
        3: 'date-desc',
    };

    const handleContentSort = (value) => {
        const config = sortConfig[contentSwitcher];

        setSortBy(config.options.find(option => option.value === value));
        setContent(prev => [...prev].sort(config.sorting[value]));
    }

    const getSortOptions = () => sortConfig[contentSwitcher].options || 0;

    useEffect(() => {
        if (query) {
            const loadContent = async () => {
                try {
                    let content = [];

                    let defaultSort = defaultSorting[contentSwitcher];
                    setSortOptions(getSortOptions());

                    const normalisedQuery = query.toLowerCase();
                    const posts = await getAllPosts();
                    const users = await getAllUsers();
                    const comments = await getAllComments();

                    if (contentSwitcher === 1) {
                        content = posts.filter((post) => {
                            const titleMatches = post.title
                                .toLowerCase()
                                .includes(normalisedQuery);

                            const bodyMatches = post.content
                                .toLowerCase()
                                .includes(normalisedQuery);

                            const tagMatches =
                                Array.isArray(post.tags) &&
                                post.tags.some((tag) =>
                                    tag.toLowerCase().includes(normalisedQuery)
                                );

                            return titleMatches || bodyMatches || tagMatches;
                        });

                        setSortBy({ value: 'date-desc', label: 'Newest first' });
                    }

                    if (contentSwitcher === 2) {
                        content = users
                            .filter((userArray) => {
                                return userArray[0].includes(normalisedQuery);
                            })
                            .map(([handle, userData]) => ({
                                handle,
                                ...userData,
                            }));

                        setSortBy({ value: 'posts-desc', label: 'Most posts' });
                    }

                    if (contentSwitcher === 3) {
                        content = comments.filter((comment) => {
                            return comment.content
                                .toLowerCase()
                                .includes(normalisedQuery);
                        });

                        setSortBy({ value: 'date-desc', label: 'Newest first' });
                    }

                    setContent(content.sort(sortConfig[contentSwitcher].sorting[defaultSort]));

                    await new Promise((resolve) => setTimeout(resolve, 300));
                    toggleContentDelay(false);

                    setLoadingAnim(false);
                } catch (e) {
                    console.error(
                        `Failed getting search results for ${query}:`,
                        e
                    );
                }
            };

            loadContent();
        }
    }, [query, contentSwitcher]);

    const renderRows = () => {
        switch (contentSwitcher) {
            case 1:
                return content.map((post, index) => (
                    <PostRow key={index*4356} post={post} preview />
                ));
            case 2:
                return content.map((user, index) => (
                    <UserRow key={index*1877} user={user} />
                ));
            case 3:
                return content.map((comment, index) => (
                    <CommentRow
                        key={index*2323}
                        comment={comment}
                    />
                ));
            default:
                return null;
        }
    };

    const sortStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'rgb(194, 186, 186)',
            borderRadius: '15px',
            border: 'none',
            marginLeft: '20px',
            transition: 'all 0.3s ease',
            outline: state.isFocused ? '1px solid black' : '1px solid transparent',
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

    }

    if (!query) return <Loader />;

    return (
        <div id="search-results-wrapper">
            <h1>Search results for "{query}"</h1>
            <div id="search-results-options">
                <div className="button-container">
                    <button
                        className={`button-highlight
                            ${
                                contentSwitcherHighlight === 1
                                    ? 'highlight-posts'
                                    : ''
                            }
                            ${
                                contentSwitcherHighlight === 2
                                    ? 'highlight-users'
                                    : ''
                            }
                            ${
                                contentSwitcherHighlight === 3
                                    ? 'highlight-comments'
                                    : ''
                            }`}
                        disabled
                    >
                        {contentSwitcher === 1 && 'Posts'}
                        {contentSwitcher === 2 && 'Users'}
                        {contentSwitcher === 3 && 'Comments'}
                    </button>
                    <button onClick={() => handleContentSwitch(1)}>
                        Posts
                    </button>
                    <button onClick={() => handleContentSwitch(2)}>
                        Users
                    </button>
                    <button onClick={() => handleContentSwitch(3)}>
                        Comments
                    </button>
                </div>
                <Select options={sortOptions} value={sortBy} styles={sortStyles} onChange={(selected) => handleContentSort(selected.value)}/>
            </div>
            <div id="search-results-content">
                <div
                    className={`search-results-container glassmorphic-bg
                    ${loadingAnim ? 'rotating-border-loading' : ''}
                    ${contentDelay ? 'content-loading' : ''}
                `}
                >
                    {content.length ? (
                        renderRows()
                    ) : (
                        <p className="no-acc-content">
                            {contentSwitcher === 1 && 'No posts found.'}
                            {contentSwitcher === 2 && 'No users found.'}
                            {contentSwitcher === 3 && 'No comments found.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchResults;

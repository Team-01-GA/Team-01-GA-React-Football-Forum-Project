import '../SearchResults/SearchResults.css';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader/Loader';
import { getAllComments, getAllPosts } from '../../services/posts.service';
import { getAllUsers } from '../../services/user.service';
import CommentRow from '../../components/CommentRow/CommentRow';
import UserRow from '../../components/UserRow/UserRow';
import PostRow from '../../components/PostRow/PostRow';
import Select from 'react-select';

const postFilterOptions = [
    { value: 'none', label: 'None' },
    { value: 'noEngagement', label: 'No engagement yet' },
];
const postFilters = {
    none: () => true,
    noEngagement: (post) => !post?.commentCount && !post?.likes,
};

const userFilterOptions = [
    { value: 'none', label: 'None' },
    { value: 'noActivity', label: 'No posts, likes, or comments' },
    { value: 'isBlocked', label: 'Blocked users' },
    { value: 'notBlocked', label: 'Not blocked users' },
];
const userFilters = {
    none: () => true,
    noActivity: (user) =>
        (!user.posts || Object.keys(user.posts).length === 0) &&
        (!user.likedPosts || Object.keys(user.likedPosts).length === 0) &&
        (!user.comments || Object.keys(user.comments).length === 0),
    isBlocked: (user) => !!user.isBlocked,
    notBlocked: (user) => !user.isBlocked,
};

const commentFilterOptions = [
    { value: 'none', label: 'None' },
];
const commentFilters = {
    none: () => true,
};

function AdminPanel() {
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
    const [sortBy, setSortBy] = useState({
        value: 'date-desc',
        label: 'Newest first',
    });

    const [filterBy, setFilterBy] = useState(postFilterOptions[0]);

    const [forumCount, setForumCount] = useState({
        posts: 0,
        users: 0,
        comments: 0,
    })

    const getFilterOptions = () => {
        if (contentSwitcher === 1) return postFilterOptions;
        if (contentSwitcher === 2) return userFilterOptions;
        if (contentSwitcher === 3) return commentFilterOptions;
        return [];
    };
    const getFilterFn = () => {
        if (contentSwitcher === 1) return postFilters[filterBy.value];
        if (contentSwitcher === 2) return userFilters[filterBy.value];
        if (contentSwitcher === 3) return commentFilters[filterBy.value];
        return () => true;
    };

    useEffect(() => {
        setFilterBy(getFilterOptions()[0]);
    }, [contentSwitcher]);

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
                'date-desc': (a, b) =>
                    new Date(b.createdOn) - new Date(a.createdOn),
                'date-asc': (a, b) =>
                    new Date(a.createdOn) - new Date(b.createdOn),
                'likes-desc': (a, b) => (b.likes || 0) - (a.likes || 0),
                'likes-asc': (a, b) => (a.likes || 0) - (b.likes || 0),
                'comments-desc': (a, b) =>
                    (b.commentCount || 0) - (a.commentCount || 0),
                'comments-asc': (a, b) =>
                    (a.commentCount || 0) - (b.commentCount || 0),
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
                'posts-desc': (a, b) =>
                    Object.keys(b.posts || {}).length -
                    Object.keys(a.posts || {}).length,
                'posts-asc': (a, b) =>
                    Object.keys(a.posts || {}).length -
                    Object.keys(b.posts || {}).length,
                'likes-desc': (a, b) =>
                    Object.keys(b.likedPosts || {}).length -
                    Object.keys(a.likedPosts || {}).length,
                'likes-asc': (a, b) =>
                    Object.keys(a.likedPosts || {}).length -
                    Object.keys(b.likedPosts || {}).length,
                'comments-desc': (a, b) =>
                    Object.keys(b.comments || {}).length -
                    Object.keys(a.comments || {}).length,
                'comments-asc': (a, b) =>
                    Object.keys(a.comments || {}).length -
                    Object.keys(b.comments || {}).length,
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
                'date-desc': (a, b) =>
                    new Date(b.createdOn) - new Date(a.createdOn),
                'date-asc': (a, b) =>
                    new Date(a.createdOn) - new Date(b.createdOn),
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
        setSortBy(config.options.find((option) => option.value === value));
        setContent((prev) => [...prev].sort(config.sorting[value]));
    };

    const getSortOptions = () => sortConfig[contentSwitcher].options || [];

    const handleContentSwitch = async (content) => {
        setContentSwitcherHighlight(content);
        toggleContentDelay(true);
        setLoadingAnim(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        setContentSwitcher(content);
    };

    useEffect(() => {
        setLoadingAnim(true);
        const loadContent = async () => {
            try {
                let loadedContent = [];
                const posts = await getAllPosts();
                const users = await getAllUsers();
                const comments = await getAllComments();

                setForumCount({
                    posts: posts.length,
                    users: users.length,
                    comments: comments.length,
                })

                if (contentSwitcher === 1) {
                    loadedContent = posts;
                }
                if (contentSwitcher === 2) {
                    loadedContent = users.map(([handle, userData]) => ({
                                handle,
                                ...userData,
                            }))
                }
                if (contentSwitcher === 3) {
                    loadedContent = comments;
                }
                setContent(
                    loadedContent.sort(
                        sortConfig[contentSwitcher].sorting[defaultSorting[contentSwitcher]]
                    )
                );
                setSortBy(
                    sortConfig[contentSwitcher].options.find(
                        (opt) => opt.value === defaultSorting[contentSwitcher]
                    )
                );
                setLoadingAnim(false);
                toggleContentDelay(false);
            } catch (e) {
                console.error('Failed to load admin panel: ', e);
                setContent([]);
                setLoadingAnim(false);
                toggleContentDelay(false);
            }
        };

        loadContent();
    }, [contentSwitcher]);

    useEffect(() => {
        setSortOptions(getSortOptions());
    }, [contentSwitcher]);

    useEffect(() => {
        setFilterBy(getFilterOptions()[0]);
    }, [contentSwitcher]);

    const filteredContent = content.filter(getFilterFn());

    const renderRows = (content) => {
        switch (contentSwitcher) {
            case 1:
                return content.map((post, index) => (
                    <PostRow key={index * 4356} post={post} preview />
                ));
            case 2:
                return content.map((user, index) => (
                    <UserRow key={index * 1877} user={user} />
                ));
            case 3:
                return content.map((comment, index) => (
                    <CommentRow key={index * 2323} comment={comment} />
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
            outline: state.isFocused
                ? '1px solid black'
                : '1px solid transparent',
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

    return (
        <div id="search-results-wrapper">
            <h1>Admin Panel</h1>
            <div id='forum-details'>
                <p className="forum-detail">
                    Posts: {forumCount.posts}
                </p>
                <p className="forum-detail">
                    Users: {forumCount.users}
                </p>
                <p className="forum-detail">
                    Comments: {forumCount.comments}
                </p>
            </div>
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
                <Select
                    options={sortOptions}
                    value={sortBy}
                    styles={sortStyles}
                    onChange={(selected) => handleContentSort(selected.value)}
                    isSearchable={false}
                    aria-label="Sort results"
                />
                <Select
                    options={getFilterOptions()}
                    value={filterBy}
                    styles={sortStyles}
                    onChange={(selected) => setFilterBy(selected)}
                    isSearchable={false}
                    aria-label="Filter results"
                />
            </div>
            <div id="search-results-content">
                <div
                    className={`search-results-container glassmorphic-bg
                    ${loadingAnim ? 'rotating-border-loading' : ''}
                    ${contentDelay ? 'content-loading' : ''}
                `}
                >
                    {filteredContent.length ? (
                        renderRows(filteredContent)
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

export default AdminPanel;
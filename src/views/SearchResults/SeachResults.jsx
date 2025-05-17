import { useParams } from 'react-router-dom';
import './SeachResults.css';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader/Loader';
import { getAllComments, getAllPosts } from '../../services/posts.service';
import { getAllUsers } from '../../services/user.service';
import CommentRow from '../../components/CommentRow/CommentRow';
import UserRow from '../../components/UserRow/UserRow';
import PostRow from '../../components/PostRow/PostRow';

function SeachResults() {
    const { query: rawQuery } = useParams();

    const [query, setQuery] = useState(null);
    const [contentSwitcherHighlight, setContentSwitcherHighlight] = useState(1);
    const [contentSwitcher, setContentSwitcher] = useState(1);
    const [loadingAnim, setLoadingAnim] = useState(false);
    const [contentDelay, toggleContentDelay] = useState(false);
    const [content, setContent] = useState([]);

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

    useEffect(() => {
        if (query) {
            const loadContent = async () => {
                try {
                    let content = [];
                    const normalisedQuery = query.toLowerCase();

                    if (contentSwitcher === 1) {
                        const posts = await getAllPosts();
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
                    }

                    if (contentSwitcher === 2) {
                        const users = await getAllUsers();
                        content = users
                            .filter((userArray) => {
                                return userArray[0].includes(normalisedQuery);
                            })
                            .map(([handle, userData]) => ({
                                handle,
                                ...userData,
                            }));
                    }

                    if (contentSwitcher === 3) {
                        const comments = await getAllComments();
                        content = comments.filter((comment) => {
                            return comment.content
                                .toLowerCase()
                                .includes(normalisedQuery);
                        });
                    }

                    setContent(content);

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

    if (!query) return <Loader />;

    return (
        <div id="search-results-wrapper">
            <h1>Search results for "{query}"</h1>
            <div id="search-results-switcher">
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

export default SeachResults;

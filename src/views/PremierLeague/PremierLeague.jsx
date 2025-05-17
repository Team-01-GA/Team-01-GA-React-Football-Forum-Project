import { useEffect } from 'react';
import AllPosts from '../AllPosts/AllPosts';

export default function PremierLeague({ searchQuery, setSearchQuery }) {

    useEffect(() => {
        document.title = 'Premier League - React Fantasy Football Forum';
    }, []);

    return <AllPosts category="premier-league" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}
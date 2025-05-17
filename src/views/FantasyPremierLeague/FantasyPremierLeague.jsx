import { useEffect } from 'react';
import AllPosts from '../AllPosts/AllPosts';

export default function FantasyPremierLeague({ searchQuery, setSearchQuery }) {

    useEffect(() => {
        document.title = 'Fantasy League - React Fantasy Football Forum';
    }, []);

    return <AllPosts category="fantasy-premier-league" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}
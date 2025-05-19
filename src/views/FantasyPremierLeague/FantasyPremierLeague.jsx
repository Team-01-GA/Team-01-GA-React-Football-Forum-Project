import { useEffect } from 'react';
import AllPosts from '../AllPosts/AllPosts';

export default function FantasyPremierLeague() {

    useEffect(() => {
        document.title = 'Fantasy League - React Fantasy Football Forum';
    }, []);

    return <AllPosts category="fantasy-premier-league" />;
}
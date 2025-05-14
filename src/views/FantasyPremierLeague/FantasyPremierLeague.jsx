import AllPosts from '../AllPosts/AllPosts';

export default function FantasyPremierLeague({ searchQuery, setSearchQuery }) {
    return <AllPosts category="fantasy-premier-league" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}
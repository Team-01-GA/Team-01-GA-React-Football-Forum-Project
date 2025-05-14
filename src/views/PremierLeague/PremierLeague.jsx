import AllPosts from '../AllPosts/AllPosts';

export default function PremierLeague({ searchQuery, setSearchQuery }) {
    return <AllPosts category="premier-league" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { userSearchAPI } from '../services/api';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import './community.css';

interface CommunityMember {
    username: string;
    displayName: string;
    bio?: string;
    gameCount: number;
    joinedAt: string;
}

interface SearchResponse {
    users: CommunityMember[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    searchQuery: string;
}

const Community: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<CommunityMember[]>([]);
    const [featuredUsers, setFeaturedUsers] = useState<CommunityMember[]>([]);
    const [allUsers, setAllUsers] = useState<CommunityMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'featured' | 'all'>('featured');
    const [showOnlyWithGames, setShowOnlyWithGames] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });
    const [allUsersPagination, setAllUsersPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // Initialize fade-in animations
    useFadeInOnScroll([featuredUsers, users, allUsers, loading]);

    // Load featured users on mount
    useEffect(() => {
        loadFeaturedUsers();
    }, []);

    // Load all users when view mode changes or filter changes
    useEffect(() => {
        if (viewMode === 'all') {
            loadAllUsers(1);
        }
    }, [viewMode, showOnlyWithGames]);

    const loadFeaturedUsers = async () => {
        try {
            setLoading(true);
            const response = await userSearchAPI.getFeaturedCommunityMembers(12);
            setFeaturedUsers(response);
        } catch (error: any) {
            console.error('Failed to load featured users:', error);
            setError('Failed to load featured users.');
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await userSearchAPI.getAllUsers({
                page,
                limit: 20,
                hasGames: showOnlyWithGames ? true : undefined
            });
            
            if (page === 1) {
                setAllUsers(response.users);
            } else {
                setAllUsers(prev => [...prev, ...response.users]);
            }
            
            setAllUsersPagination(response.pagination);
        } catch (error: any) {
            console.error('Failed to load all users:', error);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string, page = 1) => {
        if (!query.trim()) {
            setIsSearching(false);
            setUsers([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setIsSearching(true);
            
            const response: SearchResponse = await userSearchAPI.searchUsers({
                q: query.trim(),
                page,
                limit: 12
            });
            
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (error: any) {
            console.error('Search failed:', error);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    // Add debounce timer ref
    const searchTimerRef = React.useRef<NodeJS.Timeout>();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Clear previous timer
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        
        // Auto-search after 500ms delay
        if (value.trim().length >= 2) {
            searchTimerRef.current = setTimeout(() => {
                handleSearch(value);
            }, 500);
        } else if (value.trim().length === 0) {
            setIsSearching(false);
            setUsers([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setUsers([]);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
    };

    const CommunityMemberCard: React.FC<{ member: CommunityMember }> = ({ member }) => (
        <div className="community-card">
            <div className="community-info">
                <div className="community-header">
                    <h3 className="community-name">{member.displayName}</h3>
                    {member.gameCount > 0 && (
                        <span className="game-badge" title={`${member.gameCount} published game${member.gameCount === 1 ? '' : 's'}`}>
                            {member.gameCount} game{member.gameCount === 1 ? '' : 's'}
                        </span>
                    )}
                </div>
                <p className="community-username">@{member.username}</p>
                
                {member.bio && (
                    <p className="community-bio">{member.bio}</p>
                )}
            </div>

            <div className="community-actions">
                <Link 
                    to={`/users/${member.username}`} 
                    className="btn btn-secondary"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );

    return (
        <div className="community-page">
            <Helmet>
                <meta name="robots" content="noindex, follow" />
                <meta name="description" content="Find fellow solo game developers and discover their projects" />
            </Helmet>
            <section className="page-header" data-fade data-delay="1">
                <div className="container">
                    <h1>Community</h1>
                    <p>Find fellow game developers and discover their projects</p>
                </div>
            </section>
            
            <section className="section-compact" data-fade data-delay="2">
                <div className="container">
                {/* Search */}
                <section className="search-section" data-fade data-delay="2">
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <div className="search-input-group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search community members by username or name..."
                                className="search-input"
                            />
                            {searchQuery && (
                                <button 
                                    type="button" 
                                    onClick={clearSearch}
                                    className="clear-search-button"
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                            <button type="submit" className="search-button" disabled={loading}>
                                Search
                            </button>
                        </div>
                    </form>
                </section>

                {/* View Mode Toggle and Filter - Only show when not searching */}
                {!isSearching && (
                    <section className="view-controls" data-fade data-delay="2">
                        <div className="view-mode-toggle">
                            <button 
                                className={`toggle-button ${viewMode === 'featured' ? 'active' : ''}`}
                                onClick={() => setViewMode('featured')}
                            >
                                Featured
                            </button>
                            <button 
                                className={`toggle-button ${viewMode === 'all' ? 'active' : ''}`}
                                onClick={() => setViewMode('all')}
                            >
                                All Members
                            </button>
                        </div>
                        
                        {viewMode === 'all' && (
                            <div className="filter-options">
                                <label className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={showOnlyWithGames}
                                        onChange={(e) => {
                                            setShowOnlyWithGames(e.target.checked);
                                            setAllUsersPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                    />
                                    <span>Show members with games</span>
                                </label>
                            </div>
                        )}
                    </section>
                )}

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Results */}
                <section className="community-content" data-fade data-delay="3">
                    {isSearching ? (
                        <div className="search-results">
                            <h2>
                                {loading ? 'Searching...' : `Search Results for "${searchQuery}"`}
                            </h2>
                            
                            {!loading && users.length === 0 && (
                                <div className="no-results">
                                    <p>No community members found matching "{searchQuery}"</p>
                                    <p>Try searching for different terms or browse the community below.</p>
                                </div>
                            )}

                            {users.length > 0 && (
                                <>
                                    <div className="community-grid">
                                        {users.map((member) => (
                                            <CommunityMemberCard key={member.username} member={member} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="pagination">
                                            <button 
                                                onClick={() => handleSearch(searchQuery, pagination.page - 1)}
                                                disabled={pagination.page === 1 || loading}
                                                className="btn btn-secondary"
                                            >
                                                Previous
                                            </button>
                                            <span className="pagination-info">
                                                Page {pagination.page} of {pagination.pages}
                                            </span>
                                            <button 
                                                onClick={() => handleSearch(searchQuery, pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages || loading}
                                                className="btn btn-secondary"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : viewMode === 'featured' ? (
                        <div className="featured-section">
                            <h2>Featured Members</h2>
                            <p>Discover fellow game developers in our community</p>
                            
                            {loading ? (
                                <div className="loading-state">Loading community members...</div>
                            ) : featuredUsers.length > 0 ? (
                                <div className="community-grid">
                                    {featuredUsers.map((member) => (
                                        <CommunityMemberCard key={member.username} member={member} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No community members yet.</p>
                                    <p>Be the first to add your games and join the community!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="all-members-section">
                            <h2>All Members</h2>
                            <p>{showOnlyWithGames ? 'Members who have published games' : 'All community members'}</p>
                            
                            {loading && allUsers.length === 0 ? (
                                <div className="loading-state">Loading members...</div>
                            ) : allUsers.length > 0 ? (
                                <>
                                    <div className="community-grid">
                                        {allUsers.map((member) => (
                                            <CommunityMemberCard key={member.username} member={member} />
                                        ))}
                                    </div>

                                    {/* Load More */}
                                    {allUsersPagination.page < allUsersPagination.pages && (
                                        <div className="load-more-container">
                                            <button 
                                                onClick={() => loadAllUsers(allUsersPagination.page + 1)}
                                                disabled={loading}
                                                className="btn btn-secondary load-more-button"
                                            >
                                                {loading ? 'Loading...' : 'Load More'}
                                            </button>
                                            <p className="pagination-info">
                                                Showing {allUsers.length} of {allUsersPagination.total} members
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state">
                                    <p>{showOnlyWithGames 
                                        ? 'No members with published games yet.' 
                                        : 'No community members found.'}</p>
                                    {showOnlyWithGames && (
                                        <p>Try unchecking the filter to see all members.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
                </div>
            </section>
        </div>
    );
};

export default Community;
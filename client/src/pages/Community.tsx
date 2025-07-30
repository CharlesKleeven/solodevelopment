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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Initialize fade-in animations
    useFadeInOnScroll([featuredUsers, users, loading]);

    // Load featured users on mount
    useEffect(() => {
        loadFeaturedUsers();
    }, []);

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Auto-search after 500ms delay
        if (value.trim().length >= 2) {
            setTimeout(() => {
                if (searchQuery === value) {
                    handleSearch(value);
                }
            }, 500);
        } else if (value.trim().length === 0) {
            setIsSearching(false);
            setUsers([]);
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
                <title>Community - SoloDevelopment</title>
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
                            <button type="submit" className="search-button" disabled={loading}>
                                Search
                            </button>
                        </div>
                    </form>
                </section>

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
                    ) : (
                        <div className="featured-section">
                            <h2>Community Members</h2>
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
                    )}
                </section>
                </div>
            </section>
        </div>
    );
};

export default Community;
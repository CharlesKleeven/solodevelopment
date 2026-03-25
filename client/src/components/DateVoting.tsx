import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dateVoteAPI } from '../services/api';
import './dateVoting.css';

interface DateOption {
    id: string;
    startDate: string;
    endDate: string;
    voteCount: number;
    suggestedBy: string | null;
    userVoted: boolean;
}

interface DateVotingProps {
    jamId: string;
    isDateVotingOpen: boolean;
}

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const DateVoting: React.FC<DateVotingProps> = ({ jamId, isDateVotingOpen }) => {
    const { user } = useAuth();
    const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
    const [hasSuggested, setHasSuggested] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [suggestStart, setSuggestStart] = useState('');
    const [suggestEnd, setSuggestEnd] = useState('');
    const [suggestError, setSuggestError] = useState('');
    const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

    useEffect(() => {
        loadDateOptions();
    }, [jamId]);

    const loadDateOptions = async () => {
        try {
            const data = await dateVoteAPI.getDateOptions(jamId);
            setDateOptions(data.dateOptions);
            setHasSuggested(data.hasSuggested);
        } catch (err) {
            console.error('Failed to load date options:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (dateOptionId: string, vote: boolean) => {
        if (!isDateVotingOpen) return;
        setSaving(dateOptionId);

        // Optimistic update
        setDateOptions(prev => prev.map(opt =>
            opt.id === dateOptionId
                ? { ...opt, userVoted: vote, voteCount: opt.voteCount + (vote ? 1 : -1) }
                : opt
        ));

        try {
            await dateVoteAPI.voteOnDate(dateOptionId, vote);
        } catch (err: any) {
            loadDateOptions();
            if (err.response?.data?.error) {
                alert(err.response.data.error);
            }
        } finally {
            setSaving(null);
        }
    };

    const handleSuggest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuggestError('');

        if (!suggestStart || !suggestEnd) {
            setSuggestError('Both dates are required');
            return;
        }

        if (suggestEnd <= suggestStart) {
            setSuggestError('End date must be after start date');
            return;
        }

        setSubmittingSuggestion(true);
        try {
            await dateVoteAPI.suggestDate(jamId, suggestStart + 'T12:00:00Z', suggestEnd + 'T12:00:00Z');
            setShowSuggestForm(false);
            setSuggestStart('');
            setSuggestEnd('');
            loadDateOptions();
        } catch (err: any) {
            setSuggestError(err.response?.data?.error || 'Failed to suggest date');
        } finally {
            setSubmittingSuggestion(false);
        }
    };

    if (loading) return null;
    if (dateOptions.length === 0) return null;

    return (
        <section className="date-voting-section">
            <div className="container">
                <div className="date-voting">
                    <div className="date-voting-header">
                        <h3>Vote on the next jam date</h3>
                        {!isDateVotingOpen && <span className="date-voting-closed">Voting closed</span>}
                    </div>
                    <p className="date-voting-note">Most of our jams start on a Friday and span over the weekend.</p>

                    <div className="date-options-list">
                        {dateOptions.map(option => {
                            const isPast = new Date(option.endDate) < new Date();
                            return (
                            <div key={option.id} className={`date-option-row ${option.userVoted ? 'voted' : ''} ${isPast ? 'past' : ''}`}>
                                {isDateVotingOpen && !isPast ? (
                                    <button
                                        className={`date-vote-btn ${option.userVoted ? 'active' : ''}`}
                                        onClick={() => handleVote(option.id, !option.userVoted)}
                                        disabled={saving === option.id}
                                    >
                                        {option.userVoted ? '✓' : '○'}
                                    </button>
                                ) : (
                                    <span className="date-vote-placeholder"></span>
                                )}
                                <span className="date-range">
                                    {formatDate(option.startDate)} — {formatDate(option.endDate)}
                                    {option.suggestedBy && <span className="date-suggested-badge">user suggested</span>}
                                </span>
                                <span className="date-vote-count">{option.voteCount}</span>
                            </div>
                            );
                        })}
                    </div>

                    {isDateVotingOpen && !hasSuggested && (
                        <div className="date-suggest-section">
                            {!user ? (
                                <button
                                    className="date-suggest-toggle"
                                    onClick={() => window.location.href = '/login'}
                                >
                                    None of these work? Log in to suggest a date
                                </button>
                            ) : !showSuggestForm ? (
                                <button
                                    className="date-suggest-toggle"
                                    onClick={() => setShowSuggestForm(true)}
                                >
                                    None of these work? Suggest a date
                                </button>
                            ) : (
                                <form className="date-suggest-form" onSubmit={handleSuggest}>
                                    <div className="date-suggest-inputs">
                                        <label>
                                            Start
                                            <input
                                                type="date"
                                                value={suggestStart}
                                                onChange={e => setSuggestStart(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <label>
                                            End
                                            <input
                                                type="date"
                                                value={suggestEnd}
                                                onChange={e => setSuggestEnd(e.target.value)}
                                                required
                                            />
                                        </label>
                                    </div>
                                    {suggestError && <p className="date-suggest-error">{suggestError}</p>}
                                    <div className="date-suggest-actions">
                                        <button type="submit" className="btn btn-primary" disabled={submittingSuggestion}>
                                            {submittingSuggestion ? 'Submitting...' : 'Suggest'}
                                        </button>
                                        <button type="button" className="btn btn-ghost" onClick={() => setShowSuggestForm(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DateVoting;

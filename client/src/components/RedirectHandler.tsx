import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RedirectHandler = () => {
    const { slug } = useParams<{ slug: string }>();
    const [error, setError] = useState(false);

    useEffect(() => {
        const checkRedirect = async () => {
            if (!slug) return;

            // Use environment variable for API URL, fallback to production URL
            const apiUrl = process.env.REACT_APP_API_URL ||
                          (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api/redirect');

            try {
                // For production, we need to call the API endpoint
                if (window.location.hostname !== 'localhost') {
                    // In production, call the API to get redirect URL
                    const response = await fetch(`/api/redirect/${slug}`);
                    const data = await response.json();

                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        setError(true);
                    }
                } else {
                    // In development, use the backend redirect
                    window.location.href = `http://localhost:3001/${slug}`;
                }
            } catch (err) {
                setError(true);
            }
        };

        checkRedirect();
    }, [slug]);

    if (error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <p>The page "/{slug}" does not exist.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Redirecting...</h2>
            <p>Please wait...</p>
        </div>
    );
};

export default RedirectHandler;
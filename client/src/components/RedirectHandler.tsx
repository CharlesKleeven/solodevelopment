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
                          (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');

            try {
                // Call the backend redirect endpoint directly
                const response = await fetch(`${apiUrl}/${slug}`, {
                    method: 'GET',
                    redirect: 'manual' // Don't follow redirects automatically
                });

                // Check if it's a redirect or CORS blocked response
                if (response.type === 'opaqueredirect' || response.status === 301 || response.status === 302 || response.status === 0) {
                    // Navigate directly to backend URL which will handle the redirect
                    window.location.href = `${apiUrl}/${slug}`;
                } else if (response.status === 404) {
                    setError(true);
                }
            } catch (err) {
                // If fetch fails (CORS), try direct navigation
                window.location.href = `${apiUrl}/${slug}`;
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
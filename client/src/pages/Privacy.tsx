import React from 'react';
import './privacy.css';

const Privacy: React.FC = () => {
    return (
        <div className="privacy-page">
            <section className="page-header-compact">
                <h1>Privacy Policy</h1>
                <p>How we handle your data</p>
            </section>

            <section className="section-balanced">
                <div className="container">
                    <p>
                        We collect only the information necessary to operate the site: your account details, submitted projects,
                        and basic usage data such as page views and jam participation.
                    </p>

                    <p>
                        We do not sell your data, share it with third parties, or use third-party trackers.
                    </p>

                    <p>
                        If you’d like to access or delete your data, you can reach out through the support page or contact a moderator.
                    </p>

                    <p className="privacy-meta">Last updated: July 2025</p>
                </div>
            </section>
        </div>
    );
};

export default Privacy;

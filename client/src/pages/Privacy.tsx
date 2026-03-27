import React from 'react';
import { Helmet } from 'react-helmet-async';
import './privacy.css';

const Privacy: React.FC = () => {
    return (
        <div className="privacy-page">
            <Helmet>
                <title>Privacy Policy - Solo Development</title>
                <meta name="description" content="Privacy policy for solodevelopment.org." />
                <link rel="canonical" href="https://solodevelopment.org/privacy" />
            </Helmet>
            <section className="page-header">
                <h1>Privacy Policy</h1>
                <p>How we handle your data</p>
            </section>

            <section className="section-balanced">
                <div className="container privacy-content">

                    <p>We built this site for our community, not to collect data. We only gather what's necessary to keep things running and we go out of our way to protect your privacy.</p>

                    <h2>What we collect</h2>
                    <p>We collect basic account information when you sign up, and activity data when you use site features like voting or submitting content. Where possible, we use anonymized or hashed data instead of storing identifying information.</p>
                    <p>If you sign in through a third-party provider, we only receive your public profile information. We do not receive or store your passwords from those platforms.</p>

                    <h2>Cookies and storage</h2>
                    <p>We use cookies for authentication only. We do not use tracking cookies, analytics, or third-party advertising.</p>

                    <h2>Third-party services</h2>
                    <p>We use third-party services for hosting, authentication, and email delivery. We do not use any trackers or advertising services.</p>

                    <h2>How we use your data</h2>
                    <p>Your data is used only to operate the site and the Solo Development ecosystem. We do not sell, share, or provide your data to third parties for marketing or advertising.</p>

                    <h2>Data retention and deletion</h2>
                    <p>Your data is retained as long as your account exists. You can request access, correction, or deletion of your data at any time through the <a href="/support">support page</a> or by contacting a moderator on <a href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer nofollow">Discord</a>.</p>

                    <h2>Children</h2>
                    <p>This site is not directed at children under 13. If you believe a child under 13 has created an account, please contact us and we will remove it.</p>

                    <h2>Changes</h2>
                    <p>We may update this policy from time to time. Significant changes will be noted on this page.</p>

                    <p className="privacy-meta">Last updated: March 2026</p>
                </div>
            </section>
        </div>
    );
};

export default Privacy;

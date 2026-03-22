import React, { useState, useEffect } from 'react';
import './discord-banner.css';

const DiscordBanner: React.FC = () => {
    const [show, setShow] = useState(() => sessionStorage.getItem('discord-banner-closed') !== 'true');
    const [memberCount, setMemberCount] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://discord.com/api/guilds/797525908378353674/widget.json')
            .then(res => res.json())
            .then(data => {
                if (data.presence_count) setMemberCount(data.presence_count);
            })
            .catch(() => {});
    }, []);

    const handleClose = () => {
        setShow(false);
        sessionStorage.setItem('discord-banner-closed', 'true');
    };

    if (!show) return null;

    return (
        <div className="discord-banner">
            <div className="discord-banner-content">
                {memberCount ? (
                    <span><strong>{memberCount.toLocaleString()}</strong> devs online right now — </span>
                ) : (
                    <span>Solo game devs are hanging out right now — </span>
                )}
                <a href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer nofollow">Join our Discord</a>
            </div>
            <button className="discord-banner-close" onClick={handleClose}>&times;</button>
        </div>
    );
};

export default DiscordBanner;

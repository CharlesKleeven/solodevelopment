import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav>
            <Link to="/">SoloDevelopment</Link>
            {' | '}
            <Link to="/jams">Jams</Link>
            {' | '}
            <Link to="/showcase">Showcase</Link>
            {' | '}
            <Link to="/resources">Resources</Link>
            {' | '}
            <Link to="/community">Community</Link>
            {' | '}
            <Link to="/login">Login</Link>
            {' | '}
            <Link to="/register">Sign Up</Link>
            <hr />
        </nav>
    );
};

export default Navbar;
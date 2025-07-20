# SoloDevelopment

A community platform for solo game developers to connect, showcase their work, and participate in game jams.

**Live at [SoloDevelopment.org](https://solodevelopment.org)**

## About

SoloDevelopment is a quiet space for developers building games mostly by themselves. We provide a supportive community where solo devs can share their work, get honest feedback, and feel less alone in their journey.

### Mission

To help solo game developers succeed by connecting them with other solo developers and giving their work fair visibility. We're not trying to revolutionize anything - just creating a space where people making games alone can find community and support.

### Community Links

- [Discord](https://discord.gg/uXeapAkAra) - Join our Discord server
- [Reddit](https://reddit.com/r/solodevelopment) - Visit our subreddit  
- [Itch.io](https://solodevelopment.itch.io/) - Follow our itch.io page

## Features

- **Game Showcase** - Browse and discover games created by community members
- **Game Jams** - Monthly and seasonal jams to help start or finish projects
- **User Profiles** - Create an account to track your projects and connect with others
- **Discord & Reddit Integration** - Links to active community spaces
- **Resources** - Curated tools and guides for solo developers

## Tech Stack

### Frontend
- React 19 with TypeScript
- React Router for navigation
- Axios for API communication
- CSS modules for styling

### Backend
- Node.js with Express 5
- MongoDB with Mongoose
- JWT authentication with httpOnly cookies
- Resend for email services
- Express Rate Limiting & Helmet for security

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance
- Resend API key for email functionality

### Installation

1. Clone the repository
```bash
git clone https://github.com/CharlesKleeven/solodevelopment.git
cd solodevelopment
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables

Create a `.env` file in the server directory:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:3000
```

4. Run the development servers
```bash
# From root directory
npm run dev
```

This will start both the client (port 3000) and server (port 3001) concurrently.

## Project Structure

```
solodevelopment/
├── client/              # React frontend
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # React context providers
│   │   ├── data/       # Static data (games, etc)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service layer
│   │   └── styles/     # Global styles
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic
│   └── package.json
└── package.json        # Root package.json
```

## Contributing

We welcome contributions! Whether it's bug fixes, new features, or improvements to documentation, every contribution helps make SoloDevelopment better for the community.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

### Looking for something to work on?

Check out our [Issues](https://github.com/CharlesKleeven/solodevelopment/issues) page for:
- Bug reports
- Feature requests
- Documentation improvements
- Good first issues for newcomers

Feel free to open new issues for bugs you find or features you'd like to see!

### Roadmap

See our [open issues](https://github.com/CharlesKleeven/solodevelopment/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) for a list of proposed features and enhancements.

## Security

- Never commit `.env` files or secrets
- Report security vulnerabilities privately (see [SECURITY.md](SECURITY.md))
- All user passwords are hashed with bcrypt
- Sessions use httpOnly cookies for protection

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Built by and for the solo game development community.
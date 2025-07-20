# Security

## Found a Security Issue?

If you discover a vulnerability, please don't create a public issue. Email us privately at: [issues@SoloDevelopment.org] with details about what you found and how to reproduce it.

## How We Protect User Data

- **Passwords** are hashed with bcrypt before storage
- **Sessions** use httpOnly cookies to prevent XSS attacks
- **API endpoints** have rate limiting and input validation
- **Database credentials** are stored in environment variables, never in code
- **JWT tokens** are signed and expire after 7 days

## For Contributors

- Never commit `.env` files or any secrets
- Always validate and sanitize user input
- Keep dependencies updated for security patches
- Test authentication flows can't be bypassed

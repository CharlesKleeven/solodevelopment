# Local Development Setup Guide

## Setting up the Database

### Option 1: Local MongoDB (Recommended for development)

1. **Install MongoDB locally:**
   - Mac: `brew install mongodb-community`
   - Ubuntu/Debian: `sudo apt install mongodb`
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo`

2. **Start MongoDB:**
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
   - Docker: (already running from the command above)

3. **Update your `.env` file:**
   ```bash
   cd server
   cp .env.example .env
   ```

   Edit the `.env` file and set:
   ```
   MONGO_URI=mongodb://localhost:27017/solodevelopment
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update your `.env` with the connection string

## Creating an Admin User

Once your database is set up, create an admin user:

```bash
cd server
npx ts-node src/scripts/createAdminUser.ts
```

This will create an admin user with:
- Username: `admin`
- Password: `admin123`
- Email: (from your .env ADMIN_EMAIL or `admin@solodevelopment.local`)

## Running the Application

1. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the site:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Admin panel: http://localhost:3000/admin

## Managing Jams

1. Log in with your admin credentials
2. Go to `/admin/jams`
3. Delete the old jam if needed
4. Create a new jam with:
   - Jam ID: `solodevelopment-jam-9-halloween` (or any URL-friendly ID)
   - Title: Halloween Jam
   - URL: Your itch.io jam URL
   - Dates: Your jam start and end dates

## Troubleshooting

### Can't connect to MongoDB
- Make sure MongoDB is running: `ps aux | grep mongod`
- Check if port 27017 is available: `lsof -i :27017`
- Verify your connection string in `.env`

### Can't log in
- Run the admin user creation script again
- Check that `emailVerified` is true in the database
- Make sure JWT_SECRET is set in your `.env`

### Changes not showing up
- Clear browser cache
- Restart both frontend and backend servers
- Check browser console for errors
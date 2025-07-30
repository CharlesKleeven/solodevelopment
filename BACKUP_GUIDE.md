# Vote Backup System - Admin Guide

## Overview
The vote backup system protects against data loss by creating regular snapshots of all theme votes. This guide explains how to use and manage backups.

## Automatic Backups
- **Frequency**: Every 6 hours automatically
- **Retention**: 30 days (older backups are deleted automatically)
- **What's backed up**: All themes and votes for jams with voting open

## Admin Backup Operations

### 1. Creating a Manual Backup

**When to use**: Before major changes, after suspicious activity, or as a precaution

**Steps**:
1. Go to Admin Dashboard (`/admin`)
2. Click on "View Voting Results" to see current vote state
3. Open browser console (F12) and navigate to Console tab
4. Run this command:
   ```javascript
   // Replace 'summer-jam-2025' with your jam ID
   fetch('/api/backup/create/summer-jam-2025', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ reason: 'Manual backup before theme changes' })
   }).then(r => r.json()).then(console.log)
   ```

### 2. Viewing All Backups

**Steps**:
1. Open browser console (F12)
2. Run this command:
   ```javascript
   // Replace 'summer-jam-2025' with your jam ID
   fetch('/api/backup/jam/summer-jam-2025', {
     credentials: 'include'
   }).then(r => r.json()).then(data => {
     console.table(data.backups.map(b => ({
       id: b._id,
       type: b.backupType,
       date: new Date(b.timestamp).toLocaleString(),
       votes: b.voteCount,
       themes: b.themeCount
     })))
   })
   ```

### 3. Viewing Backup Details

**Steps**:
1. Get backup ID from the list above
2. Run this command:
   ```javascript
   // Replace with actual backup ID
   fetch('/api/backup/BACKUP_ID_HERE', {
     credentials: 'include'
   }).then(r => r.json()).then(data => {
     console.log('Backup Details:', data.backup);
     console.log('Theme Scores:', data.backup.data.themes);
     console.log('Total Votes:', data.backup.data.votes.length);
   })
   ```

### 4. Restoring from a Backup

**⚠️ WARNING**: This will replace ALL current votes with the backup data!

**Steps**:
1. Create a manual backup first (see step 1)
2. Get the backup ID you want to restore
3. Run this command:
   ```javascript
   // Replace with actual backup ID
   if (confirm('Are you sure you want to restore from this backup? This will replace ALL current votes!')) {
     fetch('/api/backup/restore/BACKUP_ID_HERE', {
       method: 'POST',
       credentials: 'include'
     }).then(r => r.json()).then(console.log)
   }
   ```

## Best Practices

1. **Before Theme Changes**: Always create a manual backup before adding/removing themes
2. **After Suspicious Activity**: If you notice unusual voting patterns, create a backup immediately
3. **Before Closing Voting**: Create a final backup before closing voting
4. **Regular Checks**: Periodically verify backups are being created (check every few days)

## Troubleshooting

### If votes disappear:
1. Don't panic - check backups first
2. Find the most recent backup with the correct vote count
3. Restore from that backup
4. Investigate what caused the issue

### If backup restore fails:
1. Check browser console for error details
2. Ensure you're logged in as admin
3. Try a different backup
4. Contact developer if issue persists

## Quick Reference - Backup API Endpoints

All endpoints require admin authentication:

- `POST /api/backup/create/:jamId` - Create manual backup
- `GET /api/backup/jam/:jamId` - List all backups for a jam
- `GET /api/backup/:backupId` - Get backup details
- `POST /api/backup/restore/:backupId` - Restore from backup

## Emergency Contacts

If you encounter issues with the backup system:
1. Create a manual backup immediately (if possible)
2. Document the exact time and what happened
3. Contact the development team with details

---

Remember: The backup system is your safety net. When in doubt, create a backup!
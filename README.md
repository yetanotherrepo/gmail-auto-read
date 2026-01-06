# Gmail Auto Mark as Read

Automatically mark all incoming Gmail emails as read. Perfect for notification-heavy mailboxes, secondary accounts, or anyone practicing Inbox Zero without manual processing.

## Why?

- 📬 **Notification overload** — hundreds of automated emails you never need to read
- 🔕 **Secondary mailbox** — catch-all address that just needs archiving  
- 🧘 **Inbox Zero** — keep your inbox clean without the mental overhead
- 📱 **Badge anxiety** — eliminate that red notification counter

## Quick Start

### 1. Create the Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Delete any existing code
4. Copy and paste the contents of `Code.gs` from this repository
5. Save the project (Ctrl+S) and give it a name

### 2. Authorize

1. Select `initialCleanup` from the function dropdown
2. Click **Run**
3. Click **Review Permissions** when prompted
4. Select your Google account
5. Click **Advanced** → **Go to [project name] (unsafe)**
6. Click **Allow**

### 3. Clear Existing Unread Emails

Run `initialCleanup` to mark all your current unread emails as read. If you have thousands of emails, you may need to run it multiple times (Apps Script has a 6-minute execution limit).

### 4. Set Up Automatic Trigger

1. Select `createTrigger` from the function dropdown
2. Click **Run**

Done! The script will now check for unread emails every 10 minutes and mark them as read.

## Functions

| Function | Description |
|----------|-------------|
| `markAllAsRead` | Main function — marks up to 500 unread threads as read per run |
| `createTrigger` | Sets up automatic execution every 10 minutes |
| `removeTrigger` | Disables automatic execution |
| `initialCleanup` | One-time cleanup for large backlogs (handles rate limits) |
| `checkStatus` | Shows unread count and trigger status |

## Customization

### Change Trigger Frequency

Edit the `createTrigger` function and change `.everyMinutes(10)` to:
- `.everyMinutes(5)` — every 5 minutes (more aggressive, may hit rate limits)
- `.everyMinutes(15)` — every 15 minutes
- `.everyMinutes(30)` — every 30 minutes
- `.everyHours(1)` — every hour

### Filter Specific Emails

Modify the search query in `markAllAsRead`:

```javascript
// Only mark emails from specific sender
var threads = GmailApp.search('is:unread from:notifications@example.com', 0, batchSize);

// Only mark emails with specific label
var threads = GmailApp.search('is:unread label:automated', 0, batchSize);

// Exclude important emails
var threads = GmailApp.search('is:unread -is:important', 0, batchSize);
```

## Limitations

- **50 threads per batch** — conservative limit to avoid Gmail rate limiting
- **500 threads per run** — prevents timeout and quota issues
- **6-minute execution limit** — Apps Script timeout for triggered functions
- **~10 minute delay** — emails may stay unread for up to 10 minutes (or your configured interval)

## Troubleshooting

### "Gmail operation not allowed" error

This means you're hitting Gmail's rate limits. The script handles this gracefully and will continue on the next trigger run. If you have many unread emails, it may take several runs to process them all.

### Script keeps failing

1. Run `removeTrigger` to stop the current trigger
2. Wait a few minutes for rate limits to reset
3. Run `createTrigger` to start fresh

## Uninstall

1. Run `removeTrigger` to stop automatic execution
2. Go to [script.google.com](https://script.google.com) and delete the project

## License

MIT — do whatever you want with it.

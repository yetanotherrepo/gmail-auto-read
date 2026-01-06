/**
 * Gmail Auto Mark as Read
 * 
 * Automatically marks all incoming emails as read.
 * Useful for secondary/notification mailboxes where you want 
 * to archive everything without manual processing.
 * 
 * @author yetanotherrepo
 * @license MIT
 */

/**
 * Main function that marks unread emails as read.
 * Processes up to 500 threads per execution with rate-limit handling.
 */
function markAllAsRead() {
  var batchSize = 50; // Reduced batch size to avoid rate limits
  var processed = 0;
  var maxPerRun = 500; // Conservative limit to stay within quotas
  
  while (processed < maxPerRun) {
    try {
      var threads = GmailApp.search('is:unread', 0, batchSize);
      
      if (threads.length === 0) {
        Logger.log('All emails marked as read. Total processed: ' + processed);
        return;
      }
      
      GmailApp.markThreadsRead(threads);
      processed += threads.length;
      Logger.log('Processed: ' + processed + ' threads');
      
      // Longer delay to avoid Gmail rate limiting
      Utilities.sleep(1000);
      
    } catch (e) {
      Logger.log('Error after ' + processed + ' threads: ' + e.message);
      Logger.log('Will continue on next trigger run');
      return; // Exit gracefully, will continue on next trigger
    }
  }
  
  Logger.log('Reached limit per run (' + maxPerRun + '), will continue next time');
}

/**
 * Creates a time-based trigger that runs markAllAsRead every 10 minutes.
 * Removes all existing triggers before creating a new one.
 */
function createTrigger() {
  // Remove ALL existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Create new trigger - every 10 minutes (gives time for execution to complete)
  ScriptApp.newTrigger('markAllAsRead')
    .timeBased()
    .everyMinutes(10)
    .create();
    
  Logger.log('Trigger created: every 10 minutes');
}

/**
 * Removes all triggers associated with this project.
 * Use this to disable automatic marking.
 */
function removeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
    removed++;
  }
  
  Logger.log('Removed ' + removed + ' trigger(s)');
}

/**
 * One-time cleanup function to process all accumulated unread emails.
 * Run this manually before setting up the trigger if you have
 * a large backlog of unread messages. Handles rate limits gracefully.
 */
function initialCleanup() {
  var totalProcessed = 0;
  var batchSize = 50;
  var consecutiveErrors = 0;
  
  while (consecutiveErrors < 3) {
    try {
      var threads = GmailApp.search('is:unread', 0, batchSize);
      
      if (threads.length === 0) {
        break;
      }
      
      GmailApp.markThreadsRead(threads);
      totalProcessed += threads.length;
      consecutiveErrors = 0; // Reset error counter on success
      Logger.log('Progress: ' + totalProcessed);
      Utilities.sleep(1000);
      
    } catch (e) {
      consecutiveErrors++;
      Logger.log('Error #' + consecutiveErrors + ': ' + e.message);
      Utilities.sleep(5000); // Wait 5 seconds after error
    }
  }
  
  Logger.log('Initial cleanup complete. Processed: ' + totalProcessed);
}

/**
 * Shows current status: number of unread emails and active triggers.
 */
function checkStatus() {
  var totalUnread = GmailApp.getInboxUnreadCount();
  
  var triggers = ScriptApp.getProjectTriggers();
  var activeTriggers = triggers.length;
  
  Logger.log('=== Status ===');
  Logger.log('Unread emails in inbox: ' + totalUnread);
  Logger.log('Active triggers: ' + activeTriggers);
  Logger.log('==============');
}

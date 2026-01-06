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
 * Processes up to 5000 threads per execution to stay within
 * Google Apps Script time limits (6 minutes for triggers).
 */
function markAllAsRead() {
  var batchSize = 100; // Gmail API limit for markThreadsRead
  var processed = 0;
  var maxPerRun = 5000; // Safety limit to avoid timeout
  
  while (true) {
    var threads = GmailApp.search('is:unread', 0, batchSize);
    
    if (threads.length === 0) {
      Logger.log('All emails marked as read. Total processed: ' + processed);
      break;
    }
    
    GmailApp.markThreadsRead(threads);
    processed += threads.length;
    Logger.log('Processed: ' + processed + ' threads');
    
    if (processed >= maxPerRun) {
      Logger.log('Reached limit per run, will continue on next trigger');
      break;
    }
    
    Utilities.sleep(100); // Small delay to avoid rate limiting
  }
}

/**
 * Creates a time-based trigger that runs markAllAsRead every 5 minutes.
 * Removes any existing triggers for this function before creating a new one.
 */
function createTrigger() {
  // Remove existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'markAllAsRead') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create new trigger - every 5 minutes
  ScriptApp.newTrigger('markAllAsRead')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  Logger.log('Trigger created successfully');
}

/**
 * Removes all triggers associated with markAllAsRead function.
 * Use this to disable automatic marking.
 */
function removeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'markAllAsRead') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  
  Logger.log('Removed ' + removed + ' trigger(s)');
}

/**
 * One-time cleanup function to process all accumulated unread emails.
 * Run this manually before setting up the trigger if you have
 * a large backlog of unread messages.
 */
function initialCleanup() {
  var totalProcessed = 0;
  var batchSize = 100;
  
  while (true) {
    var threads = GmailApp.search('is:unread', 0, batchSize);
    
    if (threads.length === 0) {
      break;
    }
    
    GmailApp.markThreadsRead(threads);
    totalProcessed += threads.length;
    Logger.log('Progress: ' + totalProcessed);
    Utilities.sleep(200);
  }
  
  Logger.log('Initial cleanup complete. Processed: ' + totalProcessed);
}

/**
 * Shows current status: number of unread emails and active triggers.
 */
function checkStatus() {
  var unreadThreads = GmailApp.search('is:unread', 0, 1);
  var totalUnread = GmailApp.getInboxUnreadCount();
  
  var triggers = ScriptApp.getProjectTriggers();
  var activeTriggers = 0;
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'markAllAsRead') {
      activeTriggers++;
    }
  }
  
  Logger.log('=== Status ===');
  Logger.log('Unread emails in inbox: ' + totalUnread);
  Logger.log('Active triggers: ' + activeTriggers);
  Logger.log('==============');
}

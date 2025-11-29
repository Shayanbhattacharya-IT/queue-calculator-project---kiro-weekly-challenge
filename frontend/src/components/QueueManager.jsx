import React, { useState, useEffect } from 'react';
import { getQueueStatus, completeQueueEntry } from '../services/api';
import './QueueManager.css';

function QueueManager({ userId }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notifiedQueues, setNotifiedQueues] = useState(new Set());

  useEffect(() => {
    requestNotificationPermission();
    loadQueueStatus();
    
    // Check queue status every 30 seconds
    const interval = setInterval(loadQueueStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }

  async function loadQueueStatus() {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getQueueStatus(userId);
      setQueues(data);
      setLoading(false);
      
      // Check if any queue needs notification (15 minutes before)
      data.forEach(queue => {
        if (queue.remainingMinutes <= 15 && 
            queue.remainingMinutes > 0 && 
            notificationPermission === 'granted' &&
            !notifiedQueues.has(queue.id)) {
          showNotification(queue);
          setNotifiedQueues(prev => new Set([...prev, queue.id]));
        }
      });
    } catch (err) {
      console.error('Failed to load queue status:', err);
      setLoading(false);
    }
  }

  function showNotification(queue) {
    const title = '🔔 Your Turn is Coming Soon!';
    const body = `${queue.locationName} - Only ${queue.remainingMinutes} minutes left in queue!`;
    
    new Notification(title, {
      body,
      tag: `queue-${queue.id}`,
      requireInteraction: true
    });
  }

  async function completeQueue(entryId) {
    try {
      await completeQueueEntry(entryId);
      loadQueueStatus();
    } catch (err) {
      console.error('Failed to complete queue:', err);
    }
  }

  // Don't show anything while loading or if no queues
  if (loading || queues.length === 0) {
    return null;
  }

  return (
    <div className="queue-manager">
      <h3>🎫 Your Active Queues</h3>
      
      {notificationPermission !== 'granted' && (
        <div className="notification-prompt">
          <p>Enable notifications to get alerted when your turn is near!</p>
          <button onClick={requestNotificationPermission}>
            Enable Notifications
          </button>
        </div>
      )}
      
      <div className="queue-list">
        {queues.map(queue => (
          <div key={queue.id} className={`queue-card ${queue.remainingMinutes <= 5 ? 'urgent' : ''}`}>
            <div className="queue-header">
              <h4>{queue.locationName}</h4>
              <span className="queue-position">#{queue.queuePosition}</span>
            </div>
            
            <div className="queue-details">
              <p className="location-info">{queue.city}, {queue.state}</p>
              
              <div className="time-info">
                <div className="time-remaining">
                  <strong>{queue.remainingMinutes}</strong> min remaining
                </div>
                <div className="time-elapsed">
                  {queue.elapsedMinutes} min elapsed
                </div>
              </div>
              
              {queue.remainingMinutes <= 5 && (
                <div className="alert-message">
                  ⚠️ Your turn is coming soon! Please be ready.
                </div>
              )}
            </div>
            
            <button 
              onClick={() => completeQueue(queue.id)}
              className="complete-button"
            >
              Mark as Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QueueManager;

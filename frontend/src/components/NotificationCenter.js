import React from 'react';
import { FaBell, FaEnvelope, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';

const NotificationCenter = ({ userRole, userId, userEmail, onViewAll }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      let notifData = [];
      try {
        if (userEmail) {
          const r = await axios.get('/api/user/notifications', { params: { email: userEmail, userRole } });
          notifData = r.data || [];
        }
      } catch (_) {
        // ignore and try fallback
      }
      // Fallback for agro: allow fetching by id when email not available or primary returned empty
      if ((userRole === 'agro') && (!userEmail || notifData.length === 0) && userId) {
        try {
          const r2 = await axios.get('/api/user/agro/notifications', { params: { id: userId, limit: 10 } });
          notifData = r2.data || notifData;
        } catch (_) { /* ignore */ }
      }
      setNotifications(notifData);
      // Alerts (farmer only)
      if (userEmail) {
        try {
          const a = await axios.get('/api/user/alerts', { params: { email: userEmail } });
          setAlerts(a.data || []);
        } catch (_) { setAlerts([]); }
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userRole]);

  React.useEffect(() => {
    if (userEmail) {
      loadNotifications();
    }
  }, [userEmail, loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/user/notifications/${notificationId}/read`, {
        email: userEmail,
        userRole
      });
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/user/notifications/${notificationId}`, {
        data: { email: userEmail, userRole }
      });
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAlertRead = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/read`, { email: userEmail });
      setAlerts(alerts.map(a => a._id === alertId ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/dismiss`, { email: userEmail });
      setAlerts(alerts.filter(a => a._id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Order':
        return <FaShoppingCart className="text-blue-600" />;
      case 'Request':
        return <FaEnvelope className="text-yellow-600" />;
      case 'Message':
        return <FaEnvelope className="text-green-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length + alerts.filter(a => !a.isRead).length;

  // Merge notifications and alerts into a single, sorted list
  const mergedItems = React.useMemo(() => {
    const mapAlertItem = (a) => ({
      _id: a._id,
      source: 'alert',
      createdAt: a.createdAt,
      isRead: a.isRead,
      title: `${a.cropName} • ${a.alertType.replace('-', ' ')}`,
      body: a.message,
      type: a.alertType,
      meta: a,
    });
    const mapNotifItem = (n) => ({
      _id: n._id,
      source: 'notification',
      createdAt: n.createdAt,
      isRead: n.isRead,
      title: n.title,
      body: n.body,
      type: n.type,
      meta: n,
    });
    const items = [...(alerts || []).map(mapAlertItem), ...(notifications || []).map(mapNotifItem)];
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [alerts, notifications]);

  if (!userEmail) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative bg-white/90 backdrop-blur-sm text-[#2F855A] p-3 rounded-full shadow-lg hover:bg-[#2F855A] hover:text-white transition-all duration-300 border border-[#2F855A]/20 hover:scale-110"
      >
        <FaBell className={`text-xl ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-[#2F855A] to-[#D69E2E] text-white px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs opacity-90">
              {userRole === 'farmer' ? 'Order updates and responses' : 'Orders and enquiries'}
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : mergedItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications.</div>
            ) : (
              mergedItems.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !item.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Notification Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{getNotificationIcon(item.type)}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(item.createdAt)}</span>
                      </div>
                      
                      {/* Notification Title */}
                      <h4 className="font-semibold text-[#2F855A] text-sm mb-1">
                        {item.title}
                      </h4>
                      
                      {/* Notification Body */}
                      <p className={`text-sm mb-2 ${!item.isRead ? 'font-medium' : 'text-gray-700'}`}>
                        {item.body}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.source === 'alert' ? (
                            item.type === 'over-budget' ? 'bg-red-100 text-red-800' : item.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          ) : (
                            item.type === 'Order' ? 'bg-blue-100 text-blue-800' : item.type === 'Request' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          )
                        }`}>
                          {item.source === 'alert' ? `Alert: ${item.type}` : item.type}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {!item.isRead && (
                            <button
                              onClick={() => item.source === 'alert' ? markAlertRead(item._id) : markAsRead(item._id)}
                              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Mark Read
                            </button>
                          )}
                          {item.source === 'alert' ? (
                            <button
                              onClick={() => dismissAlert(item._id)}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Dismiss
                            </button>
                          ) : (
                            <button
                              onClick={() => dismissNotification(item._id)}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setShowNotifications(false)}
              className="text-sm text-[#2F855A] hover:text-[#D69E2E] font-medium"
            >
              Close
            </button>
            {typeof onViewAll === 'function' && (
              <button
                onClick={() => { setShowNotifications(false); onViewAll(); }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

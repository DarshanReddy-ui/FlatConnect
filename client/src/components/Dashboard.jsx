import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Settings,
  Loader,
  Send
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Dashboard = ({ userRole = 'resident', user }) => {
  const { 
    complaints, 
    events, 
    announcements, 
    addComplaint, 
    addEvent, 
    updateComplaintStatus,
    refreshData
  } = useAppContext();
  
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshData().then(() => {
      setLoading(false);
    });

    const pollInterval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplaintSubmit = async (complaintData) => {
    await addComplaint(complaintData, user);
    setShowComplaintForm(false);
  };

  const handleEventSubmit = async (eventData) => {
    await addEvent(eventData, user);
    setShowComplaintForm(false);
  };

  const handleStatusUpdate = (complaintId, newStatus) => {
    updateComplaintStatus(complaintId, newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'urgent': return 'text-red-500';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const displayComplaints = userRole === 'admin' 
    ? complaints 
    : complaints.filter(c => {
        // Handle both API response format and local format
        const submittedBy = c.submittedBy?.name || c.submittedBy;
        return submittedBy === user?.name;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-gray-300">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="glass-effect border-b border-gray-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </h1>
              <p className="text-gray-400 mt-1">Welcome to your community hub</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                {announcements.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
              <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {userRole === 'admin' ? 'A' : 'R'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Complaints</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-2">
                      {complaints.filter(c => c.status !== 'completed' && c.status !== 'resolved').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-effect rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Resolved Issues</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {complaints.filter(c => c.status === 'completed' || c.status === 'resolved').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Upcoming Events</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{events.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect rounded-2xl p-6 border border-gray-800/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {userRole === 'admin' ? 'All Complaints' : 'My Complaints'}
                </h2>
                <button 
                  onClick={() => setShowComplaintForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>{userRole === 'admin' ? 'New Event' : 'New Complaint'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {displayComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No complaints found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {userRole === 'admin' ? 'No complaints have been submitted yet' : 'Click "New Complaint" to report an issue'}
                    </p>
                  </div>
                ) : (
                  displayComplaints.map((complaint) => (
                    <div key={complaint._id || complaint.id} className="border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all bg-gray-900/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{complaint.title}</h3>
                          <p className="text-gray-400 text-sm mt-2">{complaint.description}</p>
                          {userRole === 'admin' && (
                            <p className="text-gray-500 text-xs mt-2">
                              Submitted by: {complaint.submittedBy?.name || complaint.submittedBy} - {complaint.apartment}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center capitalize ${getStatusColor(complaint.status)}`}>
                            {(complaint.status === 'completed' || complaint.status === 'resolved') ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {userRole === 'admin' ? complaint.status : 'Completed by Admin'}
                              </>
                            ) : (
                              complaint.status.replace('-', ' ')
                            )}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                          {userRole === 'admin' && complaint.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(complaint._id || complaint.id, 'in-progress')}
                              className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 border border-blue-400/20 rounded"
                            >
                              Start
                            </button>
                          )}
                          {userRole === 'admin' && complaint.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusUpdate(complaint._id || complaint.id, 'resolved')}
                              className="text-green-400 hover:text-green-300 text-xs px-2 py-1 border border-green-400/20 rounded"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-2xl p-6 border border-gray-800/50"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <Bell className="w-5 h-5 mr-3 text-blue-400" />
                Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id || announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium text-white">{announcement.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{announcement.content}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-effect rounded-2xl p-6 border border-gray-800/50"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event._id || event.id} className="border border-gray-800/50 rounded-xl p-4 bg-gray-900/20">
                    <h3 className="font-medium text-white">{event.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                    <div className="flex items-center text-gray-400 text-sm mt-3">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showComplaintForm && (
        <ComplaintForm 
          onClose={() => setShowComplaintForm(false)} 
          onSubmit={userRole === 'admin' ? handleEventSubmit : handleComplaintSubmit}
          userRole={userRole}
        />
      )}
    </div>
  );
};

const ComplaintForm = ({ onClose, onSubmit, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'maintenance',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setFormError(error.response.data.errors[0].msg);
        } else if (error.response.data.message) {
          setFormError(error.response.data.message);
        } else {
          setFormError('Failed to submit form.');
        }
      } else {
        setFormError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-2xl p-8 w-full max-w-md border border-gray-800/50"
      >
        <h2 className="text-2xl font-semibold mb-2 text-white">
          {userRole === 'admin' ? 'Create New Event' : 'Submit New Complaint'}
        </h2>
        {formError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder={userRole === 'admin' ? 'Event title' : 'Brief description of the issue'}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all h-24 resize-none"
              placeholder={userRole === 'admin' ? 'Event details' : 'Detailed description of the problem'}
              required
            />
          </div>

          {userRole === 'admin' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="noise">Noise</option>
                  <option value="parking">Parking</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{userRole === 'admin' ? 'Create Event' : 'Submit Complaint'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 rounded-xl transition-all border border-gray-600/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Dashboard;
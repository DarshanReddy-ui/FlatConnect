import React, { createContext, useContext, useState, useEffect } from 'react';
import { complaintsAPI, eventsAPI, announcementsAPI } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Load data when component mounts or when user changes
  useEffect(() => {
    const token = localStorage.getItem('flatConnectToken');
    if (token) {
      loadComplaints();
      loadEvents();
      loadAnnouncements();
    }
  }, []);

  const loadComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const addComplaint = async (complaintData, user) => {
    try {
      const response = await complaintsAPI.create(complaintData);
      const newComplaint = response.data.complaint;
      setComplaints(prev => [newComplaint, ...prev]);
      return newComplaint;
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const addEvent = async (eventData, user) => {
    try {
      const response = await eventsAPI.create(eventData);
      const newEvent = response.data.event;
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const addAnnouncement = async (announcementData, user) => {
    try {
      const response = await announcementsAPI.create(announcementData);
      const newAnnouncement = response.data.announcement;
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (error) {
      console.error('Error adding announcement:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    const token = localStorage.getItem('flatConnectToken');
    if (token) {
      await Promise.all([
        loadComplaints(),
        loadEvents(),
        loadAnnouncements()
      ]);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await complaintsAPI.updateStatus(complaintId, { status: newStatus });
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId || complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  };

  const value = {
    complaints,
    events,
    announcements,
    addComplaint,
    addEvent,
    addAnnouncement,
    updateComplaintStatus,
    setComplaints,
    setEvents,
    setAnnouncements,
    loadComplaints,
    loadEvents,
    loadAnnouncements,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
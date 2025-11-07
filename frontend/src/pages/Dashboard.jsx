// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import videoService from '../services/videoService.js';
import VideoPlayer from '../Components/VideoPlayer.jsx';
import './Dashboard.css'; // We'll create this next

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const socket = useSocket();
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Check if user is an Editor or Admin
  const canUpload = userRole === 'Editor' || userRole === 'Admin';

  // --- 1. Fetch initial videos ---
  useEffect(() => {
    videoService.getMyVideos()
      .then(response => {
        setVideos(response.data);
      })
      .catch(err => console.error('Failed to fetch videos', err));
  }, []);

  // --- 2. Set up Socket.io listener ---
  useEffect(() => {
    // 1. Check if any video is still processing
    const hasActiveVideos = videos.some(
      (v) =>
        v.processingStatus === 'pending' ||
        v.processingStatus === 'processing' ||
        v.processingStatus === 'analyzing'
    );

    // 2. If no videos are active, we don't need to poll.
    if (!hasActiveVideos) {
      return; // Do nothing
    }

    // 3. If a video is active, set a timer to refetch
    const pollInterval = setInterval(() => {
      console.log('Polling for video updates...');
      videoService.getMyVideos()
        .then(response => {
          setVideos(response.data); // Update the state with fresh data
        })
        .catch(err => console.error('Error during polling:', err));
    }, 3000); // Poll every 3 seconds

    // 4. IMPORTANT: Clean up the interval
    // This runs when the component unmounts OR when the 'videos' state changes
    return () => {
      clearInterval(pollInterval);
    };

  }, [videos]); // Dependency: Re-run this logic whenever the 'videos' array changes
  // --- 3. Handle File Upload ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
    setUploadMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please provide both a title and a file.');
      return;
    }
    setError('');
    setUploadProgress(0);

    try {
      const response = await videoService.upload(
        file,
        title,
        (progressEvent) => {
          // Calculate upload percentage
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      );

      setUploadMessage(response.data.message);
      // Add new video to the top of the list
      setVideos(currentVideos => [response.data.video, ...currentVideos]);
      // Reset form
      setTitle('');
      setFile(null);
      e.target.reset(); // Reset the file input
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed.');
      setUploadProgress(0);
    }
  };

  // --- Helper to get status text ---
  const getStatusLabel = (video) => {
    switch (video.processingStatus) {
      case 'pending':
        return 'Pending...';
      case 'processing':
        return 'Processing...';
      case 'analyzing':
        return 'Analyzing...';
      case 'complete':
        return `Complete (${video.sensitivityStatus})`;
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };
  const handleVideoClick = (video) => {
    if (video.processingStatus === 'complete') {
      setSelectedVideo(video);
    }
  };

  return (
    <>
    <VideoPlayer 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    <div className="dashboard-container">
      <h2>Welcome, {user.name}</h2>
      
      {/* 1. UPLOAD FORM */}
      {canUpload && (
        <section className="upload-section">
          <h3>Upload New Video</h3>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label htmlFor="title">Video Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="video">Video File</label>
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleFileChange}
                required
              />
            </div>
            {uploadProgress > 0 && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
            <button type="submit" className="upload-button">Upload</button>
            {error && <p className="auth-error">{error}</p>}
            {uploadMessage && <p className="upload-success">{uploadMessage}</p>}
          </form>
        </section>
      )}

      {/* 2. VIDEO LIBRARY */}
      <section className="library-section">
        <h3>Your Video Library</h3>
        <div className="video-list">
          {videos.length === 0 ? (
            <p>You haven't uploaded any videos yet.</p>
          ) : (
            videos.map(video => (
              <div 
                key={video._id} 
                // --- THIS IS THE FIX ---
                className={`video-item ${video.processingStatus === 'complete' ? 'clickable' : ''}`}
                onClick={() => handleVideoClick(video)}
                // --- END OF FIX ---
              >
                <div className="video-details">
                  <strong>{video.title}</strong>
                  <small>{video.originalFilename} ({(video.fileSize / 1024 / 1024).toFixed(2)} MB)</small>
                </div>
                <div className={`video-status status-${video.processingStatus}`}>
                  {getStatusLabel(video)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Dashboard;
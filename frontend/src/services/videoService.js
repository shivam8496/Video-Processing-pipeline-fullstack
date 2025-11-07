import api from './api.js';


// Upload a video
const upload = (file, title, onUploadProgress) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);

  return api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress, // Pass the progress callback to axios
  });
};


const getMyVideos = () =>{
    return api.get('/videos');
};

const videoServices = {upload,getMyVideos};

export default videoServices;

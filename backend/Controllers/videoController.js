import Video from "../Model/videoModel.js";
import {getIO} from '../socket.js';
import fs from 'fs';   
import path from 'path';
import { fileURLToPath } from 'url';


// --- ADD THESE TWO LINES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const simulateProcessing = async (video) => {
  const io = getIO();
  const socketRoom = video.user.toString();
  const videoId = video._id; // Get the ID to use for updates

  console.log(`Starting processing for video: ${video.title}`);

  try {
    // 1. 'processing' status
    // We update the doc in the DB directly
    await Video.findByIdAndUpdate(videoId, { processingStatus: 'processing' });
    io.to(socketRoom).emit('video_status', {
      videoId: videoId,
      status: 'processing',
      message: 'Processing video...',
    });

    console.log('DEBUG: Status set to processing');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 2. 'analyzing' status
    await Video.findByIdAndUpdate(videoId, { processingStatus: 'analyzing' });
    io.to(socketRoom).emit('video_status', {
      videoId: videoId,
      status: 'analyzing',
      message: 'Analyzing for sensitive content...',
    });
    
    // --------------------------------- Dummy Processing code - Start  ---------------------------------------------------------------------------------------------------------
    console.log('DEBUG: Status set to analyzing');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. 'complete' status
    const isSensitive = Math.random() > 0.8; // 20% chance of being "flagged"
    const finalStatus = isSensitive ? 'flagged' : 'safe';
    
    // --------------------------------- Dummy Processing code - ENd  ---------------------------------------------------------------------------------------------------------

    
    console.log('DEBUG: Setting status to complete');
    await Video.findByIdAndUpdate(videoId, { 
      processingStatus: 'complete',
      sensitivityStatus: finalStatus 
    });
    
    // Send the final "complete" message
    io.to(socketRoom).emit('video_status', {
      videoId: videoId,
      status: 'complete',
      message: 'Processing complete.',
      sensitivity: finalStatus,
    });
    console.log(`Processing complete for video: ${video.title}`);

  } catch (error) {
    console.error('Processing failed:', error);
    // On error, update the DB to 'failed'
    try {
      await Video.findByIdAndUpdate(videoId, { processingStatus: 'failed' });
      io.to(socketRoom).emit('video_status', {
        videoId: videoId,
        status: 'failed',
        message: 'Processing failed.',
      });
    } catch (dbError) {
      console.error('Failed to set video status to failed:', dbError);
    }
  }
};



//@desc  Upload a video
//@route POST /api/video/upload
//@access Private (Editor,Admins)

const uploadVideo = async(req , res ) =>{

    // --- DEBUG 1 ---
    console.log('--- Upload Controller Reached ---');

    if(!req.file){
        return res.status(400).json({message:"No file was found "});
    }
    
    // --- DEBUG 2 ---
    console.log('DEBUG: File found:', req.file.originalname);

    const { title } = req.body;
    if(!title){
        return res.status(400).json({message:"Title is required for the Video!!!"})
    }
    
    // --- DEBUG 3 ---
    console.log('DEBUG: Title found:', title);

    try{
        
        // --- DEBUG 4 ---
        console.log('DEBUG: Attempting to create video in database...');

        const video = await Video.create({
            user:req.user._id,
            title:title,
            originalFileName:req.file.originalname,
            filePath:req.file.path,
            fileSize:req.file.size,
            processingStatus:'pending'
        });
        
        // --- DEBUG 5 ---
        console.log('DEBUG: Database create SUCCESS. Sending response.');

        res.status(201).json({message:"Sucessfully uploaded : Processing has started !! ",video:video});
        
        // --- DEBUG 6---
        console.log('DEBUG: Processing video');

        simulateProcessing(video);

    }catch(err){
        console.error(`Error During uploading the video ${title}`,err)
        return res.status(500).json({message:'Server error during upload'});
    }

};



//@desc Get all user's video
//@route GET /api/videos
//@access Private

const getMyVideos = async (req,res) =>{
    try{
        const videos = await Video.find({user:req.user._id}).sort({createdAt:-1});
        res.status(200).json(videos);
    }catch(err){
        res.status(500).json({message:"Server error"});
    }
}



// @desc    Stream a video
// @route   GET /api/videos/stream/:id
// @access  Private
const streamVideo = async (req, res) => {
  try {
    // 1. Find the video in the database
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // 2. Security Check (Multi-Tenancy) [cite: 31]
    // Ensure the user requesting the video is the one who uploaded it.
    // if (video.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'User not authorized' });
    // }

    // 3. Get video path and stats
    const videoPath = path.join(__dirname, '..', video.filePath);
    
    const videoSize = fs.statSync(videoPath).size;

    // 4. Check for Range Header (This is the key to streaming)
    const range = req.headers.range;

    if (range) {
      // 5. Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      // 6. Send HTTP 206 'Partial Content' headers
      const head = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4', // Adjust if you support other types
      };
      res.writeHead(206, head);
      
      // 7. Pipe the stream chunk
      file.pipe(res);

    } else {
      // 8. No range header? Send the full file (e.g., for download)
      const head = {
        'Content-Length': videoSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    console.error('Video stream error:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'Video file not found on server.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};




// --- UPDATE YOUR EXPORTS ---
export { uploadVideo, getMyVideos, streamVideo };
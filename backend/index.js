// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
// import { Server } from 'socket.io';
import connectDB from './config/db.js';
import userRoutes from './Routes/userRoutes.js';  // Routes  for User management 
import videoRoutes from './Routes/videoRoutes.js';  //Routes for Video processing 
import { fileURLToPath } from 'url';
import { initSocket } from './socket.js';
import path from 'path';
// Load environment variables
dotenv.config();

// Connect to Database
connectDB();


// --- Get Directory name (for ES Modules)
const __filename  =fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// --- Middleware ---
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing)
app.use(express.json()); // Allow app to accept JSON data
app.use(express.urlencoded({ extended: false })); // Allow app to accept form data

// User Routes 
app.use('/api/users',userRoutes); 

// Video Routes
app.use('/api/videos',videoRoutes);

// --- Server Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log(path.join(__dirname, 'uploads'))
// --- Basic Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});



// --- Socket.io Setup ---
// We need an HTTP server to attach Socket.io to
const server = http.createServer(app);
const io = initSocket(server);

io.use((socket,next)=>{
  const token = socket.handshake.auth.token;
  
  if(!token){
    return next(new Error('Authentication error: Token not provided !!'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user data (id, role) to socket
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, 'User ID:', socket.user.id);

  // Join a room based on the user's ID.
  // This ensures we only send status updates to the correct user.
  socket.join(socket.user.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

})

// --- Start Server ---
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 
# Video-Processing-pipeline-fullstack

link to ptoject ==>   https://gentle-pothos-073811.netlify.app





Here is a comprehensive `README.md` file for the project you just built.

-----

# Full-Stack Video Platform

This is a complete full-stack application that allows users to upload, process, and stream video content. The application features a robust backend using **Node.js, Express, and MongoDB**, and a modern, real-time frontend using **React and Vite**.

[cite\_start]The system is built with a multi-tenant architecture in mind, featuring role-based access control (RBAC) for users, a real-time processing pipeline with live progress updates via **Socket.io**, and efficient video streaming using **HTTP range requests**[cite: 3, 11, 12, 22].

## 🚀 Core Features

  * [cite\_start]**Full-Stack Architecture:** Node.js/Express backend with a React/Vite frontend[cite: 6].
  * [cite\_start]**Authentication & RBAC:** Secure JWT (JSON Web Token) authentication and role-based access control (Viewer, Editor, Admin)[cite: 12, 32, 95].
  * [cite\_start]**Video Upload:** A complete video upload and storage system using Multer[cite: 7, 96].
  * [cite\_start]**Simulated Processing Pipeline:** An asynchronous job queue that *simulates* video processing and sensitivity analysis (classifying videos as "safe" or "flagged")[cite: 8].
  * [cite\_start]**Real-Time Progress:** A live dashboard that tracks video status changes (`pending`, `processing`, `analyzing`, `complete`) in real-time using Socket.io[cite: 10, 22].
  * [cite\_start]**Efficient Video Streaming:** A dedicated streaming endpoint that supports HTTP range requests, allowing for seeking and buffering[cite: 11, 20].
  * [cite\_start]**Multi-Tenancy:** A secure data model where users (tenants) can only access and manage their own video content[cite: 31].

-----

## 🛠️ Tech Stack

### Backend

  * [cite\_start]**Runtime:** Node.js [cite: 93]
  * [cite\_start]**Framework:** Express.js [cite: 93]
  * [cite\_start]**Database:** MongoDB (with Mongoose) [cite: 94]
  * [cite\_start]**Real-Time:** Socket.io [cite: 94]
  * [cite\_start]**Authentication:** JSON Web Token (JWT) [cite: 95]
  * [cite\_start]**File Uploads:** Multer [cite: 96]
  * **Environment:** `dotenv`
  * **CORS:** `cors`

### Frontend

  * [cite\_start]**Framework:** React (with Vite) [cite: 98, 99]
  * **Routing:** React Router DOM
  * [cite\_start]**State Management:** React Context API [cite: 100]
  * [cite\_start]**HTTP Client:** Axios [cite: 102]
  * [cite\_start]**Real-Time:** Socket.io Client [cite: 103]
  * **Styling:** CSS

-----

## ⚙️ How It Works: System Architecture

This project is not a simple monolith. It's a decoupled system where the frontend and backend work together, which is essential for a modern web application.

### 1\. Authentication & RBAC

1.  [cite\_start]A user registers for an account and is assigned a default role (e.g., 'Viewer')[cite: 84].
2.  On login, the backend validates their credentials, creates a **JWT**, and sends it back. This token contains their User ID and role.
3.  The frontend stores this token (in `localStorage`) and attaches it as a `Bearer` token to all future API requests.
4.  Protected backend routes use `protect` middleware to validate the token.
5.  [cite\_start]Restricted routes (like video uploads) use `authorize` middleware to check if the user's role (e.g., 'Editor') is allowed to perform the action[cite: 12].

### 2\. The Video Upload & Processing Pipeline

[cite\_start]This is the core workflow of the application[cite: 82, 83].

1.  **Upload (Frontend):** An authenticated 'Editor' selects a file and provides a title. The frontend sends this as `form-data` to the backend, showing a live upload progress bar.
2.  **Ingest (Backend):**
      * The `protect` and `authorize` middleware first verify the user's token and role.
      * The `multer` middleware then intercepts the file, validates its type, and saves it to the `/uploads` folder with a unique name.
3.  **Database (Backend):** The `videoController` creates a new `Video` document in MongoDB with the file path, user ID, title, and an initial status of `"pending"`.
4.  **Response (Backend -\> Frontend):** The server *immediately* sends a `201 Created` response to the frontend, letting the user know the upload was successful. This makes the UI feel fast.
5.  **Background Processing (Backend):**
      * *After* responding, the server triggers the (simulated) `simulateProcessing` function.
      * This function uses `setTimeout` to mimic long-running tasks.
      * It updates the video's status in the database (e.g., to `"processing"`, then `"analyzing"`).
      * After each update, it uses **Socket.io** to `emit` a `video_status` event to a private "room" named after the User's ID.
6.  **Real-Time Update (Frontend):**
      * The user's dashboard is connected to Socket.io and is "listening" in its own room.
      * It receives the `video_status` event and updates the React state, causing the video's status label to change live on the page without a reload.

### 3\. Video Streaming

1.  **Click (Frontend):** The user clicks on a video that is marked "complete."
2.  **Request (Frontend):** The React modal opens and sets the `<video>` tag's `src` to the streaming endpoint: `/api/videos/stream/:id`.
3.  **Stream (Backend):**
      * The `streamVideo` controller receives the request.
      * It checks the `Range` header sent by the browser.
      * If no `Range` exists, it sends the full file.
      * If `Range` *does* exist (e.g., `bytes=0-`), it reads only that "chunk" of the video file from disk using `fs.createReadStream`.
      * It sends back a **`206 Partial Content`** response, which is the key to buffering and seeking, allowing a user to jump to any part of the video.

-----

## 🚀 Setup and Installation

### Prerequisites

  * Node.js (v18 or higher)
  * NPM
  * MongoDB Atlas Account (for your `MONGO_URI`)

### 1\. Backend Setup

1.  Navigate to the `backend` folder: `cd backend`

2.  Install dependencies: `npm install`

3.  Create a `.env` file in the `backend` root and add the following:

    ```env
    # Server port
    PORT=5001

    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://...

    # Your JWT secret for creating tokens
    JWT_SECRET=your_super_secret_key
    ```

4.  Run the backend server: `npm run dev`
    *(The server will now be running on `http://localhost:5001`)*

### 2\. Frontend Setup

1.  Open a **new terminal** and navigate to the `frontend` folder: `cd frontend`

2.  Install dependencies: `npm install`

3.  Create a `.env.development` file in the `frontend` root and add the following:

    ```env
    # The URL for your backend API
    VITE_API_URL=http://localhost:5001/api

    # The base URL for your socket/streaming server
    VITE_SOCKET_URL=http://localhost:5001
    ```

4.  Run the frontend app: `npm run dev`
    *(The app will now be running on `http://localhost:5173` or similar)*

You can now open the frontend URL in your browser, register a new user (remember to set their role to 'Editor' in your MongoDB database), and start uploading videos\!






Here is a comprehensive `README.md` file for the project you just built.

-----

# Full-Stack Video Platform

This is a complete full-stack application that allows users to upload, process, and stream video content. The application features a robust backend using **Node.js, Express, and MongoDB**, and a modern, real-time frontend using **React and Vite**.

[cite\_start]The system is built with a multi-tenant architecture in mind, featuring role-based access control (RBAC) for users, a real-time processing pipeline with live progress updates via **Socket.io**, and efficient video streaming using **HTTP range requests**[cite: 3, 11, 12, 22].

## 🚀 Core Features

  * [cite\_start]**Full-Stack Architecture:** Node.js/Express backend with a React/Vite frontend[cite: 6].
  * [cite\_start]**Authentication & RBAC:** Secure JWT (JSON Web Token) authentication and role-based access control (Viewer, Editor, Admin)[cite: 12, 32, 95].
  * [cite\_start]**Video Upload:** A complete video upload and storage system using Multer[cite: 7, 96].
  * [cite\_start]**Simulated Processing Pipeline:** An asynchronous job queue that *simulates* video processing and sensitivity analysis (classifying videos as "safe" or "flagged")[cite: 8].
  * [cite\_start]**Real-Time Progress:** A live dashboard that tracks video status changes (`pending`, `processing`, `analyzing`, `complete`) in real-time using Socket.io[cite: 10, 22].
  * [cite\_start]**Efficient Video Streaming:** A dedicated streaming endpoint that supports HTTP range requests, allowing for seeking and buffering[cite: 11, 20].
  * [cite\_start]**Multi-Tenancy:** A secure data model where users (tenants) can only access and manage their own video content[cite: 31].

-----

## 🛠️ Tech Stack

### Backend

  * [cite\_start]**Runtime:** Node.js [cite: 93]
  * [cite\_start]**Framework:** Express.js [cite: 93]
  * [cite\_start]**Database:** MongoDB (with Mongoose) [cite: 94]
  * [cite\_start]**Real-Time:** Socket.io [cite: 94]
  * [cite\_start]**Authentication:** JSON Web Token (JWT) [cite: 95]
  * [cite\_start]**File Uploads:** Multer [cite: 96]
  * **Environment:** `dotenv`
  * **CORS:** `cors`

### Frontend

  * [cite\_start]**Framework:** React (with Vite) [cite: 98, 99]
  * **Routing:** React Router DOM
  * [cite\_start]**State Management:** React Context API [cite: 100]
  * [cite\_start]**HTTP Client:** Axios [cite: 102]
  * [cite\_start]**Real-Time:** Socket.io Client [cite: 103]
  * **Styling:** CSS

-----

## ⚙️ How It Works: System Architecture

This project is not a simple monolith. It's a decoupled system where the frontend and backend work together, which is essential for a modern web application.

### 1\. Authentication & RBAC

1.  [cite\_start]A user registers for an account and is assigned a default role (e.g., 'Viewer')[cite: 84].
2.  On login, the backend validates their credentials, creates a **JWT**, and sends it back. This token contains their User ID and role.
3.  The frontend stores this token (in `localStorage`) and attaches it as a `Bearer` token to all future API requests.
4.  Protected backend routes use `protect` middleware to validate the token.
5.  [cite\_start]Restricted routes (like video uploads) use `authorize` middleware to check if the user's role (e.g., 'Editor') is allowed to perform the action[cite: 12].

### 2\. The Video Upload & Processing Pipeline

[cite\_start]This is the core workflow of the application[cite: 82, 83].

1.  **Upload (Frontend):** An authenticated 'Editor' selects a file and provides a title. The frontend sends this as `form-data` to the backend, showing a live upload progress bar.
2.  **Ingest (Backend):**
      * The `protect` and `authorize` middleware first verify the user's token and role.
      * The `multer` middleware then intercepts the file, validates its type, and saves it to the `/uploads` folder with a unique name.
3.  **Database (Backend):** The `videoController` creates a new `Video` document in MongoDB with the file path, user ID, title, and an initial status of `"pending"`.
4.  **Response (Backend -\> Frontend):** The server *immediately* sends a `201 Created` response to the frontend, letting the user know the upload was successful. This makes the UI feel fast.
5.  **Background Processing (Backend):**
      * *After* responding, the server triggers the (simulated) `simulateProcessing` function.
      * This function uses `setTimeout` to mimic long-running tasks.
      * It updates the video's status in the database (e.g., to `"processing"`, then `"analyzing"`).
      * After each update, it uses **Socket.io** to `emit` a `video_status` event to a private "room" named after the User's ID.
6.  **Real-Time Update (Frontend):**
      * The user's dashboard is connected to Socket.io and is "listening" in its own room.
      * It receives the `video_status` event and updates the React state, causing the video's status label to change live on the page without a reload.

### 3\. Video Streaming

1.  **Click (Frontend):** The user clicks on a video that is marked "complete."
2.  **Request (Frontend):** The React modal opens and sets the `<video>` tag's `src` to the streaming endpoint: `/api/videos/stream/:id`.
3.  **Stream (Backend):**
      * The `streamVideo` controller receives the request.
      * It checks the `Range` header sent by the browser.
      * If no `Range` exists, it sends the full file.
      * If `Range` *does* exist (e.g., `bytes=0-`), it reads only that "chunk" of the video file from disk using `fs.createReadStream`.
      * It sends back a **`206 Partial Content`** response, which is the key to buffering and seeking, allowing a user to jump to any part of the video.

-----

## 🚀 Setup and Installation

### Prerequisites

  * Node.js (v18 or higher)
  * NPM
  * MongoDB Atlas Account (for your `MONGO_URI`)

### 1\. Backend Setup

1.  Navigate to the `backend` folder: `cd backend`

2.  Install dependencies: `npm install`

3.  Create a `.env` file in the `backend` root and add the following:

    ```env
    # Server port
    PORT=5001

    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://...

    # Your JWT secret for creating tokens
    JWT_SECRET=your_super_secret_key
    ```

4.  Run the backend server: `npm run dev`
    *(The server will now be running on `http://localhost:5001`)*

### 2\. Frontend Setup

1.  Open a **new terminal** and navigate to the `frontend` folder: `cd frontend`

2.  Install dependencies: `npm install`

3.  Create a `.env.development` file in the `frontend` root and add the following:

    ```env
    # The URL for your backend API
    VITE_API_URL=http://localhost:5001/api

    # The base URL for your socket/streaming server
    VITE_SOCKET_URL=http://localhost:5001
    ```

4.  Run the frontend app: `npm run dev`
    *(The app will now be running on `http://localhost:5173` or similar)*

You can now open the frontend URL in your browser, register a new user (remember to set their role to 'Editor' in your MongoDB database), and start uploading videos\!
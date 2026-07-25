const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getToken } = require('next-auth/jwt');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // Middleware for NextAuth verification
  io.use(async (socket, next) => {
    try {
      // Mock Next.js req.cookies if needed by getToken
      if (!socket.request.cookies && socket.request.headers.cookie) {
        const cookieString = socket.request.headers.cookie;
        socket.request.cookies = cookieString
          .split(';')
          .reduce((res, c) => {
            const [key, val] = c.trim().split('=').map(decodeURIComponent);
            try {
              return Object.assign(res, { [key]: JSON.parse(val) });
            } catch (e) {
              return Object.assign(res, { [key]: val });
            }
          }, {});
      }
      
      console.log('Socket Auth Attempt:');
      console.log('Cookies present:', !!socket.request.headers.cookie);
      
      const token = await getToken({ 
        req: socket.request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      if (token) {
        socket.user = token; // Attach user info to socket
        next();
      } else {
        console.log('Socket Auth failed: No token found');
        next(new Error('unauthorized'));
      }
    } catch (e) {
      console.error('Socket Auth Error:', e);
      next(new Error('unauthorized'));
    }
  });

  // State Management
  // rooms: Map<roomId, { hostId, videoUrl, currentTime, isPlaying, users: Map }>
  const rooms = new Map();

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.roomId = roomId;

      let room = rooms.get(roomId);
      if (!room) {
        room = {
          hostId: socket.user.id, // Creator becomes host
          videoUrl: '', // Start empty so player is hidden until selected
          currentTime: 0,
          isPlaying: false,
          users: new Map()
        };
        rooms.set(roomId, room);
      }
      
      // Add user to room
      room.users.set(socket.user.id, {
        id: socket.user.id,
        name: socket.user.name || 'User',
        image: socket.user.picture || socket.user.image
      });

      // Send current state to the joining user
      socket.emit('room-state', {
        hostId: room.hostId,
        videoUrl: room.videoUrl,
        currentTime: room.currentTime,
        isPlaying: room.isPlaying,
        users: Array.from(room.users.values())
      });

      // Notify others that a new user joined
      io.to(roomId).emit('users-updated', Array.from(room.users.values()));
    });

    socket.on('play', (time) => {
      const room = rooms.get(socket.roomId);
      if (room && room.hostId === socket.user.id) {
        room.isPlaying = true;
        room.currentTime = time;
        socket.to(socket.roomId).emit('sync-play', time);
      }
    });

    socket.on('pause', (time) => {
      const room = rooms.get(socket.roomId);
      if (room && room.hostId === socket.user.id) {
        room.isPlaying = false;
        room.currentTime = time;
        socket.to(socket.roomId).emit('sync-pause', time);
      }
    });

    socket.on('seek', (time) => {
      const room = rooms.get(socket.roomId);
      if (room && room.hostId === socket.user.id) {
        room.currentTime = time;
        socket.to(socket.roomId).emit('sync-seek', time);
      }
    });

    socket.on('update-video', (url) => {
      const room = rooms.get(socket.roomId);
      if (room && room.hostId === socket.user.id) {
        room.videoUrl = url;
        room.currentTime = 0;
        room.isPlaying = false;
        io.to(socket.roomId).emit('video-changed', url);
      }
    });
    
    socket.on('chat-message', (message) => {
      io.to(socket.roomId).emit('chat-message', {
        user: socket.user.name || 'User',
        image: socket.user.picture || socket.user.image,
        text: message,
        time: new Date().toISOString()
      });
    });

    // WebRTC Signaling for Voice Chat
    socket.on('join-voice', () => {
      socket.to(socket.roomId).emit('user-joined-voice', socket.user.id);
    });

    socket.on('webrtc-offer', ({ targetId, offer }) => {
      socket.to(socket.roomId).emit('webrtc-offer', {
        senderId: socket.user.id,
        targetId,
        offer
      });
    });

    socket.on('webrtc-answer', ({ targetId, answer }) => {
      socket.to(socket.roomId).emit('webrtc-answer', {
        senderId: socket.user.id,
        targetId,
        answer
      });
    });

    socket.on('ice-candidate', ({ targetId, candidate }) => {
      socket.to(socket.roomId).emit('ice-candidate', {
        senderId: socket.user.id,
        targetId,
        candidate
      });
    });

    socket.on('leave-voice', () => {
      socket.to(socket.roomId).emit('user-left-voice', socket.user.id);
    });

    socket.on('disconnect', () => {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.user.id);
        io.to(socket.roomId).emit('users-updated', Array.from(room.users.values()));
        socket.to(socket.roomId).emit('user-left-voice', socket.user.id);
        
        // Clean up empty room
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
        } else if (room.hostId === socket.user.id) {
          // If host leaves, assign the next person as host
          const nextHost = Array.from(room.users.values())[0];
          room.hostId = nextHost.id;
          io.to(socket.roomId).emit('host-changed', room.hostId);
        }
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

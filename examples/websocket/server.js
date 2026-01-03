const { Server } = require('socket.io');
const { createServer } = require('http');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (data) => {
    const user = {
      id: socket.id,
      username: data.username
    };
    
    users.set(socket.id, user);
    
    // Send join message to all clients
    const joinMessage = {
      id: Date.now().toString(),
      username: 'System',
      content: `${data.username} joined the chat`,
      timestamp: new Date(),
      type: 'system'
    };
    
    io.emit('user-joined', {
      user,
      message: joinMessage
    });
    
    // Send current users list to all clients
    io.emit('users-list', {
      users: Array.from(users.values())
    });
    
    console.log(`${data.username} joined`);
  });

  // Handle messages
  socket.on('message', (data) => {
    const message = {
      id: Date.now().toString(),
      username: data.username,
      content: data.content,
      timestamp: new Date(),
      type: 'user'
    };
    
    // Broadcast message to all clients
    io.emit('message', message);
    console.log(`Message from ${data.username}: ${data.content}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      users.delete(socket.id);
      
      const leaveMessage = {
        id: Date.now().toString(),
        username: 'System',
        content: `${user.username} left the chat`,
        timestamp: new Date(),
        type: 'system'
      };
      
      io.emit('user-left', {
        user,
        message: leaveMessage
      });
      
      // Send updated users list
      io.emit('users-list', {
        users: Array.from(users.values())
      });
      
      console.log(`${user.username} disconnected`);
    }
  });
});

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`✓ WebSocket server running on port ${PORT}`);
  console.log(`  Connect from: http://localhost:3000`);
});
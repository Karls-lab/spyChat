import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3001;


// Sample data
const messages = [
  { id: 2, text: 'Message 2', userID: 0},
];

// a fix?
app.use(express.json());

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('message', (message) => {
    messages.push({ id: messages.length + 1, text: message });
    console.log('Message received: ', message);
    io.emit('message', message);
  });

});

app.get('/', (req, res) => {
  res.json(messages);
});

app.post('/', (req, res) => {
  const newMessage = { id: messages.length + 1, text: req.body.text, userID: req.body.userID};
  messages.push(newMessage);
  res.json(newMessage);
});

server.listen(port, () => {
  console.log(`Express server is running at http://localhost:${port}`);
});
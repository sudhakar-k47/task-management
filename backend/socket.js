let io;
function init(server) {
  io = require('socket.io')(server, {
    cors: { origin: '*' }
  });
  io.on('connection', socket => {
    console.log('socket connected', socket.id);
  });
  return io;
}
function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
module.exports = { init, getIO };

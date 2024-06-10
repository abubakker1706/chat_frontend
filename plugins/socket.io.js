import io from 'socket.io-client';

export default ({ app }, inject) => {
  const socket = io('http://localhost:8080');
  inject('socket', socket);
}

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const searchDialog = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const recentChats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const isTyping = ref(false);
const typingTimeout = ref(null);
const tokenString = localStorage.getItem('user');
const showMessage = ref(false);
const token = JSON.parse(tokenString);
const messagedUsers = ref([]);
const user = ref(null);
const fixed = ref(false);
const groupData = ref([]);
const onlineUsers = ref({});
const url = `wss://gsnpc2ee7i.execute-api.eu-north-1.amazonaws.com/test/`;

let socket = null;

const showMessageController = () => {
  showMessage.value = !showMessage.value;
};

const setupWebSocket = () => {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
    if (user.value) {
      socket.send(JSON.stringify({ action: 'join', userId: user.value.user_id }));
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Message from server:', data);

    switch (data.type) {
      case 'receiveMessage':
        if (selectedChat.value && (data.senderId === selectedChat.value.user_id || data.receiverId === selectedChat.value.user_id)) {
          messages.value.push(data.message);
        }
        break;
      case 'typing':
        if (selectedChat.value && data.senderId === selectedChat.value.user_id) {
          isTyping.value = true;
        }
        break;
      case 'stop_typing':
        if (selectedChat.value && data.senderId === selectedChat.value.user_id) {
          isTyping.value = false;
        }
        break;
      case 'userOnline':
        onlineUsers.value[data.userId] = { status: 'online' };
        break;
      case 'userOffline':
        onlineUsers.value[data.userId] = { status: 'offline' };
        break;
    }
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

const getFirstTwoChars = (username) => {
  if (!username) {
    return '';
  }
  return username.slice(0, 2);
};

const getMessagedUsers = async (data) => {
  console.log(data?.user_id, 'getMessagedUsers user');
  try {
    const response = await axios.get(`http://localhost:8080/api/chat/messaged-users/${data.user_id}`);
    console.log(response.data.data, 'getMessagedUsers');
    messagedUsers.value = response.data.data;
  } catch (error) {
    console.error('Error fetching messaged users:', error);
  }
};

const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });
    console.log('User data:', response.data);
    user.value = response.data;
    await getMessagedUsers(response.data);
    await getUserGroups(response.data);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'join', userId: response.data.user_id }));
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const startChat = async (user) => {
  console.log(user, 'startChat');
  selectedChat.value = user;
  searchQuery.value = '';
  searchResults.value = [];
  await fetchMessages();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ action: 'join', userId: user.user_id }));
  }
};

const selectChat = (chat) => {
  selectedChat.value = chat;
  fetchMessages();
};

const config = {
  headers: {
    'Authorization': `Bearer ${token.token}`
  }
};

const fetchMessages = async () => {
  try {
    if (!user.value || !selectedChat.value) return;
    const response = await axios.get(`http://localhost:8080/api/chat/get-messages`, {
      params: {
        userId: user.value.user_id,
        chatId: selectedChat.value.user_id,
        isGroup: false
      },
      ...config
    });
    console.log(response.data.data, 'fetching messages');
    if (response.data.success) {
      messages.value = response.data.data;
    } else {
      console.error('Error fetching messages:', response.data.error);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const sendMessage = async () => {
  console.log('Current messages:', messages.value);
  if (newMessage.value.trim() !== '' && selectedChat.value) {
    try {
      const message = {
        receiverId: selectedChat.value.user_id,
        message: newMessage.value,
        senderId: user.value.user_id,
      };
      const response = await axios.post(`http://localhost:8080/api/chat/send`, message, config);
      console.log(response.data.success, 'response data for send message');
      if (response.data.success === true) {
        socket.send(JSON.stringify({ action: 'sendMessage', message }));
        newMessage.value = '';
        stopTyping();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  console.log('Current messages after sendMessage:', messages.value);
};

const handleTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  socket.send(JSON.stringify({ action: 'typing', receiverId: selectedChat.value.user_id }));
  typingTimeout.value = setTimeout(stopTyping, 3000);
};

const stopTyping = () => {
  socket.send(JSON.stringify({ action: 'stop_typing', receiverId: selectedChat.value.user_id }));
};

const getUserGroups = async (data) => {
  console.log(data, 'getUserGroupsData');
  try {
    const response = await axios.get(`http://localhost:8080/api/chat/group/user-groups/${data.user_id}`);
    console.log(response.data, 'getUserGroup');
    groupData.value = response.data;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  setupWebSocket();
  fetchUserData();

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.action === 'receiveMessage') {
      if (selectedChat.value && (data.senderId === selectedChat.value.user_id || data.receiverId === selectedChat.value.user_id)) {
        messages.value.push(data.message);
      }
    } else if (data.action === 'typing') {
      if (selectedChat.value && data.senderId === selectedChat.value.user_id) {
        isTyping.value = true;
      }
    } else if (data.action === 'stop_typing') {
      if (selectedChat.value && data.senderId === selectedChat.value.user_id) {
        isTyping.value = false;
      }
    }
  });

  socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
  });

  socket.addEventListener('close', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const closeSearch = (newValue) => {
  searchDialog.value = newValue;
};

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});
</script>
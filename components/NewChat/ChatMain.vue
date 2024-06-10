<template>
    <div class="chat-container">
      <div class="search-bar">
        <q-input outlined v-model="searchQuery" placeholder="Search users..." @keyup.enter="searchUsers">
          <template v-slot:append>
            <q-icon name="search" @click="searchUsers" />
          </template>
        </q-input>
      </div>
      <div class="sidebar">
        <q-list bordered>
          <q-item v-for="user in users" :key="user.id" clickable @click="selectUser(user)">
            <q-item-section>{{ user?.username }}</q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="chat-window">
        <div class="chat-header">
          <div>{{ selectedUser?.username }}</div>
          <q-btn icon="menu" flat round dense @click="showAddMemberDialog = true" />
        </div>
        <div class="chat-messages">
          <q-chat-message
            v-for="msg in messages"
            :key="msg.id"
            :name="msg.senderName"
            :text="msg.message"
            :sent="msg.senderId === currentUser.id"
          />
        </div>
        <div class="chat-input">
          <q-input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
          <q-btn @click="sendMessage">Send</q-btn>
          <q-btn @click="sendGroupMessage">Send Group Message</q-btn>
        </div>
        <AddDialogMember
          v-if="showAddMemberDialog"
          :chatId="selectedUser.id"
          @close="showAddMemberDialog = false"
        />
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';
import axios from 'axios'; // Import axios for HTTP requests
import apiService from '@/services/api';

const messages = ref([]);
const newMessage = ref('');
const selectedUser = ref(null);
const currentUser = ref(null); // Changed to single object instead of array
const socket = ref(null);

const connectSocket = () => {
  socket.value = io('http://localhost:8080'); // Update with your backend URL
  socket.value.on('connect', () => {
    console.log('Socket.IO connected');
  });
  socket.value.on('receiveMessage', handleReceiveMessage);
  socket.value.on('receiveGroupMessage', handleReceiveGroupMessage);
};

const disconnectSocket = () => {
  if (socket.value) {
    socket.value.disconnect();
  }
};

const handleReceiveMessage = (data) => {
  if (selectedUser.value && data.receiverId === selectedUser.value.id) {
    messages.value.push(data);
  }
};

const handleReceiveGroupMessage = (data) => {
  if (selectedUser.value && data.groupId === selectedUser.value.id) {
    messages.value.push(data);
  }
};

const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });
    currentUser.value = response.data;
    await getMessagedUsers(response.data);
    await getUserGroups(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const sendMessage = async () => {
  // Check if selectedUser and currentUser are defined
  if (selectedUser.value && currentUser.value) {
    const message = newMessage.value.trim();
    if (message) {
      const data = {
        senderId: currentUser.value.id,
        receiverId: selectedUser.value.id,
        message,
      };
      try {
        await apiService.sendMessage(data);
        messages.value.push({
          id: Date.now(),
          senderId: currentUser.value.id,
          senderName: currentUser.value.username,
          message,
        });
        socket.value.emit('sendMessage', data);
        newMessage.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }
};

const sendGroupMessage = async () => {
  // Check if selectedUser and currentUser are defined
  if (selectedUser.value && currentUser.value) {
    const message = newMessage.value.trim();
    if (message) {
      const data = {
        groupId: selectedUser.value.id,
        senderId: currentUser.value.id,
        message,
      };
      try {
        await apiService.sendGroupMessage(data);
        messages.value.push({
          id: Date.now(),
          senderId: currentUser.value.id,
          senderName: currentUser.value.username,
          message,
        });
        socket.value.emit('sendGroupMessage', data);
        newMessage.value = '';
      } catch (error) {
        console.error('Error sending group message:', error);
      }
    }
  }
};
  
  onMounted(() => {
    connectSocket();
    fetchUserData();
  });
  
  onUnmounted(() => {
    disconnectSocket();
  });
  </script>
  
  <style scoped>
  .chat-container {
    display: grid;
    grid-template-columns: minmax(200px, 25%) 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }
  
  .search-bar {
    grid-row: 1;
    grid-column: 1 / -1;
    padding: 10px;
    background-color: #f5f5f5;
  }
  
  .sidebar {
    grid-row: 2;
    grid-column: 1;
    background-color: #f0f0f0;
    overflow-y: auto;
  }
  
  .chat-window {
    grid-row: 2;
    grid-column: 2;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #f5f5f5;
  }
  
  .chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
  }
  
  .chat-input {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f5f5f5;
  }
  </style>
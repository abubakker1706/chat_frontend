<template>
    <div>
      <div class="chat-header">
        <div>{{ selectedUser.username }}</div>
        <q-btn icon="menu" flat round dense @click="showAddMemberDialog = true" />
      </div>
      <q-chat-message
        v-for="msg in messages"
        :key="msg.id"
        :name="msg.senderName"
        :text="msg.message"
        :sent="msg.senderId === currentUser.id"
      />
      <q-input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
      <q-btn @click="sendMessage">Send</q-btn>
      <q-btn @click="sendGroupMessage">Send Group Message</q-btn>
      <AddMemberDialog
        v-if="showAddMemberDialog"
        :chatId="selectedUser.id"
        @close="showAddMemberDialog = false"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import AddMemberDialog from './AddDialogMember.vue';
  const newMessage = ref('');
  const showAddMemberDialog = ref(false);
  const socket = io();
  
  const sendMessage = () => {
    const message = newMessage.value.trim();
    if (message) {
      const data = {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        message
      };
      socket.emit('sendMessage', data);
      messages.push({ id: Date.now(), senderId: currentUser.id, senderName: currentUser.username, message });
      newMessage.value = '';
    }
  };
  
  const sendGroupMessage = () => {
    const message = newMessage.value.trim();
    if (message) {
      const data = {
        groupId: selectedUser.id, // Assuming selectedUser.id represents groupId for group chat
        senderId: currentUser.id,
        message
      };
      socket.emit('sendGroupMessage', data);
      messages.push({ id: Date.now(), senderId: currentUser.id, senderName: currentUser.username, message });
      newMessage.value = '';
    }
  };
  
  onMounted(() => {
    socket.on('receiveMessage', (data) => {
      if (selectedUser.value && data.senderId === selectedUser.value.id) {
        messages.push(data);
      }
    });
  
    socket.on('receiveGroupMessage', (data) => {
      // Handle group messages
    });
  });
  
  onUnmounted(() => {
    socket.off('receiveMessage');
    socket.off('receiveGroupMessage');
  });
  </script>
  
  <style scoped>
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #f5f5f5;
  }
  </style>
  
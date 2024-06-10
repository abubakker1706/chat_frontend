<template>
  <div class="chat-container">
    <!-- Left sidebar -->
    <div class="left-sidebar">
      <!-- Search bar -->
      <div class="search-bar">
        <q-input v-model="searchQuery" placeholder="Search or start a new chat" outlined dense v-focus style="width: 80%;" />
        <q-btn label="Search" color="primary" @click="searchUsers" />
      </div>
      <!-- Search results -->
      <div class="search-results">
        <div v-for="user in searchResults" :key="user.user_id" class="user-item" @click="startChat(user)">
          <q-avatar icon="person" />
          <span>{{ user.username }}</span>
          <q-btn color="primary" round icon="send" size="10px" @click.stop="startChat(user)">
            <q-tooltip class="bg-blue">Send Message</q-tooltip>
          </q-btn>
        </div>
      </div>
      <q-separator />
      <div style="display: flex; justify-content: space-between;">
        <q-breadcrumbs>
          <q-breadcrumbs-el label="User" icon="person" style="color: gray;" @click="showGroupChats = false" />
          <q-breadcrumbs-el label="Group" icon="people" color="primary" style="color: gray;" @click="showGroupChats = true" />
        </q-breadcrumbs>
        <div>
          <q-icon name="create" color="primary" size="22px" @click="fixed = true">
            <q-tooltip>Create New Group</q-tooltip>
          </q-icon>
        </div>
      </div>
      <q-separator />

      <!-- 1:1 chats -->
      <div class="recent-chats" v-if="!showGroupChats">
        <div v-if="messagedUsers.length > 0">
          <div v-for="chat in messagedUsers" :key="chat.user_id" class="chat-item" @click="selectChat(chat)">
            <q-avatar icon="person" />
            <div class="chat-info">
              <span class="chat-name">{{ chat.username }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No recent chats available.</p>
        </div>
      </div>

      <!-- Group chats -->
      <div class="recent-chats" v-if="showGroupChats">
        <div v-if="groupData.length > 0">
          <div v-for="chat in groupData" :key="chat.group_id" class="chat-item" @click="selectGroupChat(chat)">
            <q-avatar icon="people" />
            <div class="chat-info">
              <span class="chat-name">{{ chat.group_name }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No groups available.</p>
        </div>
      </div>
    </div>

    <!-- Right section -->
    <div class="right-section" v-if="selectedChat">
      <div class="chat-header">
        <q-avatar :icon="showGroupChats ? 'people' : 'person'" />
        <span>{{ showGroupChats ? selectedChat.group_name : selectedChat.username }}</span>
      </div>

      <!-- Chat messages -->
      <div class="chat-body">
  <div v-for="message in messages" :key="getMessageKey(message)" :class="getMessageClass(message)">
    <q-avatar v-if="isMyMessage(message)" :color="getAvatarColor(message)" text-color="white" size="20px">
      {{ getFirstTwoChars(getMessageSenderName(message)) }}
    </q-avatar>
    <q-avatar v-else :color="getAvatarColor(message)" text-color="white" size="20px">
      {{ getFirstTwoChars(getMessageSenderName(message)) }}
    </q-avatar>
    <div class="message-content">
      <span>{{ messageContent(message) }}</span>
      <span v-if="message.created_at">{{ formatMessageTime(message.created_at) }}</span>
    </div>
  </div>
</div>


      <!-- Typing Indicator -->
      <div v-if="isTyping" class="typing-indicator">
        <span>{{ showGroupChats ? getUsernameById(typingUserId) : selectedChat.username }} is typing...</span>
      </div>

      <!-- Chat input -->
      <div class="chat-footer">
        <q-input v-model="newMessage" placeholder="Type your message..." outlined dense @keyup.enter="sendMessage" @input="handleTyping" v-focus style="width: 100%;" />
        <q-btn round icon="send" @click="sendMessage" />
      </div>
    </div>
  </div>

  <q-dialog v-model="fixed" persistent>
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="q-pt-none">
        <GroupChatComponent :messageUser="messagedUsers"  :fixed="fixed"  @update:default="handleUpdateDefault" />
      </q-card-section>
     
     
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';

const searchQuery = ref('');
const searchResults = ref([]);
const recentChats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const isTyping = ref(false);
const typingTimeout = ref(null);
const tokenString = localStorage.getItem('user');
const token = JSON.parse(tokenString);
const messagedUsers = ref([]);
const user = ref(null);
const fixed = ref(false);
const groupData = ref([]);
const showGroupChats = ref(false);
const typingUserId = ref(null);
const handleUpdateDefault=(value)=>{
  console.log(value,"value for dialog")
  fixed.value = value
}
const socket = io('http://localhost:8080', {
  auth: {
    token: `Bearer ${token.token}`
  }
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

function getFirstTwoChars(username) {
  console.log(username,"username in firsttwochar")
  if (!username) {
    return '';
  }
  return username.slice(0, 2);
}
const getMessageKey = (message) => {
    if (message.chat_id) {
      return `group_${message.chat_id}`;
    } else {
      return `1_1_${message.id}`;
    }
  };

  const getMessageClass = (message) => {
    return {
      'my-message': isMyMessage(message),
      'other-message': !isMyMessage(message)
    };
  };

  const isMyMessage = (message) => {
    console.log(message,"my-message");
    return message.senderId === user.value.user_id;
  };

  const getAvatarColor = (message) => {
    console.log(message,"get-avatar-color");
    return message.isGroup||message.is_group ? 'blue' : 'blue'; 
  };

  const getMessageSenderName = (message) => {
  console.log(message.receiverId, "get-message-sender-name");
  console.log(selectedChat.value.user_id, "selected-chat");
  console.log(message.receiverId === selectedChat.value.user_id);
  console.log(selectedChat.value.username, "receiver name");

  if (message.senderId === user.value.user_id) {
    return user.value.username; // Current user sent the message
  } else if (message.receiverId === user.value.user_id) {
    return message.sender_name || selectedChat.value.username; // Current user received the message
  } else {
    return message.sender_name || selectedChat.value.username; // Some other scenario (e.g., group chat)
  }
};


  const messageContent = (message) => {
    return message.content;
  };

function getUsernameById(userId) {
  const user = messagedUsers.value.find(u => u.user_id === userId);
  return user ? user.username : 'Unknown';
}

const searchUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/auth/search?query=${searchQuery.value}`);
    searchResults.value = response.data;
  } catch (error) {
    console.error('Error searching for users:', error);
  }
};

const getMessagedUsers = async (data) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/chat/messaged-users/${data.user_id}`);
    messagedUsers.value = response.data;
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
    user.value = response.data;
    await getMessagedUsers(response.data);
    await getUserGroups(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const startChat = async (user) => {
  selectedChat.value = user;
  showGroupChats.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  if (!recentChats.value.find(chat => chat.user_id === user.user_id)) {
    recentChats.value.unshift(user);
  }
  await fetchMessages();
  socket.emit('join', user.user_id);
};

const selectChat = (chat) => {
  selectedChat.value = chat;
  showGroupChats.value = false;
  fetchMessages();
};

const selectGroupChat = (chat) => {
  selectedChat.value = chat;
  showGroupChats.value = true;
  fetchGroupMessages();
};

const config = {
  headers: {
    'Authorization': `Bearer ${token.token}`
  }
};

const fetchMessages = async () => {
  try {
    if (!user.value || !selectedChat.value) return;
    const response = await axios.get(`http://localhost:8080/api/chat/messages`, {
      params: {
        currentUserId: user.value.user_id,
        otherUserId: selectedChat.value.user_id,
        isGroup: showGroupChats.value
      },
      ...config
    });
    messages.value = response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const fetchGroupMessages = async () => {
  try {
    if (!user.value || !selectedChat.value) return;
    const response = await axios.get(`http://localhost:8080/api/chat/group/messages/${selectedChat.value.group_id}`, config);
    messages.value = response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
  }
};

const sendMessage = async () => {
  const groupId = selectedChat.value.group_id;
  const senderId = user.value.user_id;

  if (newMessage.value.trim() !== '' && selectedChat.value) {
    try {
      let message;
      if (showGroupChats.value) {
        message = {
          groupId: groupId,
          senderId: senderId,
          content: newMessage.value,
        };
      } else {
        message = {
          receiverId: selectedChat.value.user_id,
          content: newMessage.value,
          isGroup: showGroupChats.value,
        };
      }

      const endpoint = showGroupChats.value ? 'chat/group/send-message' : 'chat/send';
      const response = await axios.post(`http://localhost:8080/api/${endpoint}`, message, config);
      messages.value.push(response.data);

      socket.emit(showGroupChats.value ? 'send_group_message' : 'send_message', { ...response.data, receiverId: selectedChat.value.user_id });
      newMessage.value = '';
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
};


const handleTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  socket.emit(showGroupChats.value ? 'typing_group' : 'typing', { receiverId: selectedChat.value.user_id });
  typingTimeout.value = setTimeout(stopTyping, 3000);
};

const stopTyping = () => {
  socket.emit(showGroupChats.value ? 'stop_typing_group' : 'stop_typing', { receiverId: selectedChat.value.user_id });
};

const getUserGroups = async (data) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/chat/group/user-groups/${data.user_id}`);
    groupData.value = response.data;
  } catch (error) {
    console.error('Error fetching user groups:', error);
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchUserData();

  socket.on('receive_message', (message) => {
    if (selectedChat.value && 
        ((showGroupChats.value && message.receiverId === selectedChat.value.group_id) || 
        (!showGroupChats.value && (message.senderId === selectedChat.value.user_id || message.receiverId === selectedChat.value.user_id)))) {
      messages.value.push(message);
    }
  });

  socket.on('typing', (data) => {
    if (selectedChat.value && data.receiverId === selectedChat.value.user_id && !showGroupChats.value) {
      typingUserId.value = data.senderId;
      isTyping.value = true;
    }
  });

  socket.on('stop_typing', (data) => {
    if (selectedChat.value && data.receiverId === selectedChat.value.user_id && !showGroupChats.value) {
      isTyping.value = false;
    }
  });

  socket.on('receive_group_message', (message) => {
    if (selectedChat.value && showGroupChats.value && message.groupId === selectedChat.value.group_id) {
      messages.value.push(message);
    }
  });

  socket.on('typing_group', (data) => {
  if (selectedChat.value && showGroupChats.value && data.receiverId === selectedChat.value.group_id) {
    typingUserId.value = data.senderId;
    isTyping.value = true;
  }
});

socket.on('stop_typing_group', (data) => {
  if (selectedChat.value && showGroupChats.value && data.receiverId === selectedChat.value.group_id) {
    isTyping.value = false;
  }
});
});

onUnmounted(() => {
  socket.disconnect();
});
  

</script>



<style scoped>
.chat-container {
  display: flex;
  height: 90vh;
}

.left-sidebar {
  width: 30%;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
}

/* .recent-chats, .search-results {
  flex-grow: 1;
  overflow-y: auto;
} */

.chat-item, .user-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.chat-item:hover, .user-item:hover {
  background-color: #f0f0f0;
}

.chat-info {
  margin-left: 10px;
}

.chat-name {
  font-weight: bold;
}

/* .last-message {
  color: red
}
 */
.right-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.chat-body {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
}

.my-message {
  text-align: right;
 
}

.other-message {
  text-align: left;
}

.message-content {
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
  margin: 5px 0;
}

.my-message .message-content {
  background-color: #dcf8c6;
}

.other-message .message-content {
  background-color: #f1f0f0;
}

.typing-indicator {
  padding: 10px;
  color: #888;
}

.chat-footer {
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ccc;
  width: 100%;
}
</style>

<template>
     <SearchBar  :searchDialog="searchDialog" v-if="searchDialog" @update:searchDialog="closeSearch"  @user-selected="startChat"/>
    <div class="chat-container">
        <!-- sidebar -->
        <div class="chat-sidebar" style="background-color: #F1F5F9;height: 95vh;width: 50px;" @click="showMessageController">
            <q-avatar icon="message" >
                <q-tooltip>
          Message
        </q-tooltip>
            </q-avatar>
            <q-avatar icon="add" @click="searchDialog = true">
                <q-tooltip>Add User</q-tooltip>
            </q-avatar>
        </div>
      <!-- Left sidebar -->
      <div class="left-sidebar">
       
        
       
       
        <span style="font-size: 30px;color:#3F3F41;">Message</span>
     
        <q-separator style="margin-top: 0.8rem;" />
  
        <!-- 1:1 chats -->
          <div v-if="showMessage">
          <div v-if="messagedUsers.length > 0" class="recent-chats" >
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
        <div v-else  style="color:#D7DADD ;font-weight: 700;font-size: 30px;display: ">
                <q-avatar icon="search" style="font-size: 100px;" />
                
               <p>Explore a user to start a conversation with</p>
        </div>
        
  
        <!-- Group chats -->
        <!-- <div class="recent-chats" v-if="showGroupChats">
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
        </div> -->
      </div>
  
      <!-- Right section -->
      <div class="right-section" v-if="selectedChat">
      <div class="chat-header">
        <div>
  <q-avatar icon="person" />
  <span>{{ selectedChat.username }}</span>
  <p v-if="onlineUsers[selectedChat.user_id]" style="margin-left: 3rem;">
   
    {{ onlineUsers[selectedChat.user_id].status}}
    <q-avatar icon="circle" style="font-size: 10px;color: green;"/>
  </p>
</div>

        <q-avatar label="Basic Menu" icon="menu">
        <q-menu>
          <q-list style="min-width: 120px">
            <q-item clickable v-close-popup>
              <q-item-section>View Details</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Add member</q-item-section>
            </q-item>
         
          
          </q-list>
        </q-menu>
        </q-avatar>
      </div>

      <!-- Chat messages -->
      <div class="chat-body">
        <div v-for="message in messages" :key="message.chat_id" :class="{'my-message': message.sender_id === user.user_id, 'other-message': message.sender_id!== user.user_id}">
          
             
          <q-avatar v-if="message.sender_id === user.user_id" color="primary" text-color="white" size="20px">
      {{ getFirstTwoChars(user.username) }}
    </q-avatar>
    <q-avatar v-else color="primary" text-color="white" size="20px">
      {{ getFirstTwoChars(selectedChat.username) }}
    </q-avatar>
                 
              
          <div class="message-content">
             
            <span>{{ message.message }}</span>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="typing-indicator">
        <span>{{ selectedChat.username }} is typing...</span>
      </div>

      <!-- Chat input -->
      <div class="chat-footer">
        <q-input v-model="newMessage" placeholder="Type your message..." outlined dense @keyup.enter="sendMessage" @input="handleTyping" v-focus style="width: 100%;"/>
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
const url = `wss://7xd79lsle7.execute-api.eu-north-1.amazonaws.com/test`
const socket = io(url, {
    auth: {
        token: `Bearer ${token.token}`
    }
});

const showMessageController =()=>{
  showMessage.value =!showMessage.value;
}

socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
});
socket.on('userOnline', (userId) => {
      onlineUsers.value[userId] = { status: 'online' };
    });

    socket.on('userOffline', (userId) => {
      onlineUsers.value[userId] = { status: 'offline' };
    });
console.log(onlineUsers.value,"online users")
function getFirstTwoChars(username) {
    if (!username) {
        return '';
    }
    const twoChars = username.slice(0, 2);
    return twoChars;
}

const getMessagedUsers = async (data) => {
    console.log(data?.user_id, "getMessagedUsers userrr");
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
        socket.emit('join', response.data.user_id); // Join user room upon fetching user data
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const startChat = async (user) => {
    console.log(user, "startChat");
    selectedChat.value = user;
    searchQuery.value = '';
    searchResults.value = [];
    await fetchMessages(); 
    socket.emit('join', user.user_id);
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
        console.log(response.data.data, "fetching messages");
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
            console.log(response.data.success, "response data for send message");
            if (response.data.success === true) {
                socket.emit('sendMessage', message);
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
    socket.emit('typing', { receiverId: selectedChat.value.user_id });
    typingTimeout.value = setTimeout(stopTyping, 3000);
};

const stopTyping = () => {
    socket.emit('stop_typing', { receiverId: selectedChat.value.user_id });
};

const getUserGroups = async (data) => {
    console.log(data, "getUserGroupsDataaaaaa");
    try {
        const response = await axios.get(`http://localhost:8080/api/chat/group/user-groups/${data.user_id}`);
        console.log(response.data, "getUserGroup");
        groupData.value = response.data;
    } catch (error) {
        console.log(error);
    }
};

onMounted(() => {
    fetchUserData();
    socket.on('receiveMessage', (message) => {
        console.log(message, "message from receive message");
        if (selectedChat.value && (message.sender_id === selectedChat.value.user_id || message.receiver_id === selectedChat.value.user_id)) {
            messages.value.push(message);
        }
    });

    socket.on('typing', (data) => {
        if (selectedChat.value && data.sender_id === selectedChat.value.user_id) {
            isTyping.value = true;
        }
    });

    socket.on('stop_typing', (data) => {
        if (selectedChat.value && data.sender_id === selectedChat.value.user_id) {
            isTyping.value = false;
        }
    });
 
});
const closeSearch =(newvalue)=>{
  searchDialog.value = newvalue;
  
}
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
    justify-content: space-between;
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
  
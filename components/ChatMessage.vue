<template>
    <div class="chat-message">
      <q-img src="https://via.placeholder.com/300x200" alt="Chat Image" class="chat-image"/>
      <div class="message-content">
        <span>Nice pic</span>
        <span class="timestamp">01:37</span>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .chat-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 16px;
  }
  
  .chat-image {
    border-radius: 8px;
    margin-bottom: 8px;
  }
  
  .message-content {
    background-color: #f1f1f1;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
  }
  
  .timestamp {
    font-size: 0.8em;
    color: grey;
    margin-top: 4px;
  }
  </style>
  
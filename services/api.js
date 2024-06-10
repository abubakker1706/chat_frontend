import axios from 'axios';

export default {
  async sendMessage(data) {
    try {
      const response = await axios.post('/chat/send', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async sendGroupMessage(data) {
    try {
      const response = await axios.post('/chat/send-group-message', data);
      return response.data;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  },

  async addMemberToGroup(data) {
    try {
      const response = await axios.post('/chat/add-member', data);
      return response.data;
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  },

  async getMessages(userId, chatId, isGroup) {
    try {
      const response = await axios.get(`/chat/get-messages?userId=${userId}&chatId=${chatId}&isGroup=${isGroup}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
};
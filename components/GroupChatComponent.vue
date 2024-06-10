<template>
  <div >
    <div style="margin-left: auto;width: 10%;cursor: pointer;">
      <q-icon name="close"  size="2rem"  @click="closePopup"/>
    </div>
    <q-stepper v-model="step" ref="stepper" alternative-labels color="primary" animated>
      <q-step :name="1" title="New Group" icon="settings" :done="step > 1">
        <div style="width: 100%;">
          <q-input v-model="groupName" label="Group Name" />
          <q-input v-model="groupDescription" label="Group Description" />
        </div>
      </q-step>

      <q-step :name="2" title="Add Group Member" caption="Optional" icon="create_new_folder" :done="step > 2">
        <div class="search-bar">
          <q-input v-model="searchQuery" placeholder="Search and add user" outlined dense style="width: 80%;" />
          <q-btn label="Search" color="primary" @click="searchUsers" />
        </div>
        
        <div class="search-results">
          <div style="margin-left: 1rem;color:#A2A2A2; font-weight: 400;">
            <p>Search result :</p>
          </div>
          <div v-for="user in searchResults" :key="user.user_id" class="user-item">
            <div style="margin-left: 1rem;">
              <q-avatar icon="person" />
              <span>{{ user.username }}</span>
            </div>
            <div style="margin-right: 2rem;">
              <q-checkbox :model-value="isUserChecked(user.user_id)" @update:model-value="toggleUser(user)">
                <q-tooltip class="bg-blue">Add in group</q-tooltip>
              </q-checkbox>
            </div>
          </div>
        </div>

        <div class="q-pa-md" style="max-width: 700px; margin: 0; padding: 0">
          <q-list bordered padding>
            <q-item-label header>List Header</q-item-label>

            <q-item v-for="chat in props.messageUser" :key="chat.user_id">
              <q-item-section>
                <div class="recent-chats">
                  <div class="chat-item">
                    <div class="chat-info">
                      <q-avatar icon="person" />
                      <span class="chat-name">{{ chat.username }}</span>
                    </div>
                    <div>
                      <q-item-section side>
                        <q-item-label caption>
                          <q-checkbox :model-value="isUserChecked(chat.user_id)" @update:model-value="toggleUser(chat)">
                            <q-tooltip class="bg-blue">Add in group</q-tooltip>
                          </q-checkbox>
                        </q-item-label>
                      </q-item-section>
                    </div>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div>
            <h5>Added Member</h5>
            <div v-for="user in addedMembers" :key="user.user_id" class="added-member">
              <q-badge rounded color="primary" :label="user.username"/>
              <q-btn icon="close" @click="() => removeMember(user)" flat round dense />
            </div>
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn @click="handleNext()" color="primary" :label="step === 2 ? 'Finish' : 'Create Group'" />
          <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted ,defineEmits} from 'vue';

const props = defineProps({
  messageUser: {
    type: Array,
    required: true,
  },
  fixed:{
    type: Boolean,
    required: true,
  }
});
const emit = defineEmits()
const step = ref(1);
const groupName = ref('');
const groupDescription = ref('');
const searchResults = ref([]);
const searchQuery = ref('');
const addedMembers = ref([]);
const checkedUsers = ref(new Map());
const tokenString = localStorage.getItem('user');
const token = JSON.parse(tokenString);
const currentUser = ref(null);
const createdGroupId = ref(null);

const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });
    
    currentUser.value = response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// Check if a user is checked
const isUserChecked = (userId) => {
  return checkedUsers.value.has(userId);
};
const closePopup = () => {
  const newValue = false; 
  console.log('Emitting update:default event with value:', newValue);
  emit('update:default', newValue); 
};
// Toggle user selection
const toggleUser = (user) => {
  if (checkedUsers.value.has(user.user_id)) {
    checkedUsers.value.delete(user.user_id);
    removeMember(user);
  } else {
    checkedUsers.value.set(user.user_id, true);
    addMember(user);
  }
};

// Add user to the addedMembers list
const addMember = (user) => {
  if (!addedMembers.value.some((u) => u.user_id === user.user_id)) {
    addedMembers.value.push(user);
  }
};

// Remove user from the addedMembers list
const removeMember = (user) => {
  addedMembers.value = addedMembers.value.filter((u) => u.user_id !== user.user_id);
  checkedUsers.value.delete(user.user_id);
};

const searchUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/auth/search?query=${searchQuery.value}`);
    searchResults.value = response.data.map((user) => ({
      ...user,
      isChecked: checkedUsers.value.has(user.user_id),
    }));
  } catch (error) {
    console.error('Error searching for users:', error);
  }
};

const handleNext = async () => {
  if (step.value === 1) {
    const success = await createGroup();
    if (success) {
      step.value++;
    }
  } else if (step.value === 2) {
    await addGroupMembers();
    alert('Group created and members added successfully!');
    // Redirect to group chat or reset the form
    resetForm();
  }
};

const createGroup = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/chat/group/create', {
      groupName: groupName.value,
      description: groupDescription.value,
      adminId: currentUser.value.user_id,
    }, {
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });

    createdGroupId.value = response.data.groupId;
    alert('Group created successfully! Now add members.');
    return true;
  } catch (error) {
    console.error('Error creating group:', error);
    alert('Failed to create group');
    return false;
  }
};

const addGroupMembers = async () => {
  try {
    await Promise.all(addedMembers.value.map(member => 
      axios.post('http://localhost:8080/api/chat/group/add-member', {
        groupId: createdGroupId.value,
        memberId: member.user_id
      }, {
        headers: {
          'Authorization': `Bearer ${token.token}`
        }
      })
    ));
  } catch (error) {
    console.error('Error adding members to group:', error);
    alert('Failed to add members to group');
  }
};

const resetForm = () => {
  groupName.value = '';
  groupDescription.value = '';
  searchQuery.value = '';
  searchResults.value = [];
  addedMembers.value = [];
  checkedUsers.value.clear();
  step.value = 1;
};

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.search-results {
  margin-bottom: 1rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.added-member {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>

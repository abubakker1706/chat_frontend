<template>
    <q-dialog v-model="props.searchDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <div style="display: flex;align-items: center; justify-content: space-between;">
          <q-card-section>
            <div class="text-h6">Search User</div>
          </q-card-section>
          <div>
            <q-avatar icon="close" @click="closePopup">
              <q-tooltip>close</q-tooltip>
            </q-avatar>
          </div>
        </div>
  
        <q-card-section class="q-pt-none">
          <div class="q-pa-md">
            <div class="q-gutter-md row">
              <q-select
                filled
                v-model="model"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="filteredOptions"
                @filter="filterFn"
                hint="Minimum 2 characters to trigger filtering"
                option-label="username"
                option-value="user_id"
                style="width: 650px; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
  
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" v-close-popup @click ="confirmSelection"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const props = defineProps({
    searchDialog: {
      type: Boolean,
      required: true,
    },
  });
  
  const model = ref(null);
  const allUser = ref([]);
  const filteredOptions = ref([]);
  
  const tokenString = localStorage.getItem('user');
  const token = JSON.parse(tokenString);
  
  const filterFn = (val, update, abort) => {
    if (val.length < 2) {
      abort();
      return;
    }
  
    update(() => {
      const needle = val.toLowerCase();
      filteredOptions.value = allUser.value.filter(user =>
        user.username.toLowerCase().includes(needle)
      );
    });
  };
  
  const fetchAllUserData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/get-user', {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      });
      allUser.value = response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const emit = defineEmits();
  
  const closePopup = () => {
    emit('update:searchDialog', false);
  };
  const confirmSelection = () => {
  emit('user-selected', model.value);
  closePopup();
};

  
  onMounted(() => {
    fetchAllUserData();
  });
  </script>
  
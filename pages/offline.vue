<template>
    <div>
      <div>
        <q-input filled v-model="productName" label="Product Name" />
        <div style="margin-top: 1rem;">
          <q-btn label="Submit" type="submit" color="primary" @click="addProduct" />
        </div>
      </div>
      
      <div v-if="loading">Loading...</div>
      <div v-else>
        <q-list>
          <q-item v-for="(product,index) in products" :key="product._id">
            <q-item-section>{{index+1}} {{ product.product }}</q-item-section>
          </q-item>
        </q-list>
      </div>
  
      <q-chip v-if="offlineModeMessage" color="negative">{{ offlineModeMessage }}</q-chip>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  axios.defaults.baseURL = 'http://localhost:5000';
  
  let db;
  
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const dbPromise = window.indexedDB.open('myDatabase', 2); 
    
    dbPromise.onsuccess = (event) => {
      db = event.target.result;
      initialize();
    };
    
    dbPromise.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
    };
    
    dbPromise.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('Upgrade needed: Creating object store...');
      
      // Create the 'offlineData' object store
      try {
        if (!db.objectStoreNames.contains('offlineData')) {
          const objectStore = db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
          console.log("'offlineData' object store created successfully");
        } else {
          console.log("'offlineData' object store already exists");
        }
      } catch (error) {
        console.error('Error creating object store:', error);
      }
    };
  }
  
  const initialize = () => {
    console.log("Initializing...");
  };
  
  const storeDataOffline = async (data) => {
    if (!db) {
      console.error('IndexedDB is not available');
      return;
    }
    
    try {
      if (db.objectStoreNames.contains('offlineData')) {
        const transaction = db.transaction('offlineData', 'readwrite');
        const objectStore = transaction.objectStore('offlineData');
        const addRequest = objectStore.add({ ...data, id: generateUniqueId() });
        addRequest.onsuccess = () => {
          console.log('Data stored in IndexedDB');
          // Manually update UI when data is added offline
          fetchProducts();
        };
      } else {
        console.error("'offlineData' object store not found");
      }
    } catch (error) {
      console.error('Error storing data in IndexedDB:', error);
    }
  };
  
  const generateUniqueId = () => {
    // Generate a unique identifier for each product
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const checkInternetConnection = () => {
    return navigator.onLine;
  };
  
  const syncData = async () => {
  if (checkInternetConnection() && db) {
    const transaction = db.transaction('offlineData', 'readwrite');
    const objectStore = transaction.objectStore('offlineData');

    const cursor = await new Promise((resolve, reject) => {
      const request = objectStore.openCursor();
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });

    while (cursor) {
      try {
        const product = cursor.value;
        delete product.id;
        await axios.post('/api/products', product);
        console.log('Data synced with MongoDB');

        // Store the current key before continuing
        const currentKey = cursor.primaryKey;

        // Continue to the next item
        cursor.continue();

        // Delete the item after cursor continues
        await new Promise((resolve, reject) => {
          const deleteTransaction = db.transaction('offlineData', 'readwrite');
          const deleteObjectStore = deleteTransaction.objectStore('offlineData');
          const deleteRequest = deleteObjectStore.delete(currentKey);
          deleteRequest.onsuccess = resolve;
          deleteRequest.onerror = reject;
        });
        
      } catch (error) {
        console.error('Error syncing data with MongoDB:', error);
      }

      cursor = await new Promise((resolve, reject) => {
        const request = objectStore.openCursor();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
      });
    }

    console.log('Syncing complete');
  }
};








  const productName = ref('');
  const products = ref([]);
  const loading = ref(true);
  const offlineModeMessage = ref('');
  
  const addProduct = async () => {
    try {
      if (!navigator.onLine) {
        storeDataOffline({ product: productName.value });
        console.log('Data stored in IndexedDB');
        // Show offline mode message
        offlineModeMessage.value = 'You are in offline mode. Data will sync automatically when internet connection is back.';
      } else {
        const response = await axios.post('/api/products', { product: productName.value });
        console.log('Product added successfully');
        fetchProducts(); // Fetch the updated product list after adding online
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/all-products');
      products.value = response.data.data;
      // Clear offline mode message when online
      offlineModeMessage.value = '';
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    if (typeof window !== 'undefined') {
        // syncData()
      setInterval(syncData, 60000);
    }
    
    fetchProducts();
  });
  </script>
  
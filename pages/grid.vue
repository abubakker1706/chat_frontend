<template>
    <div style="display: flex; flex-direction: column; gap: 1rem">
      <q-input filled v-model="productName" label="Product Name" />
      <q-input filled v-model="quantity" label="Quantity" />
      <q-input filled v-model="makerName" label="Maker Name" />
      <div style="margin-top: 1rem;">
        <q-btn label="Submit" type="submit" color="primary" @click="addProduct" />
      </div>
    </div>
    <q-chip v-if="offlineMessage" label="This data is rendering from IndexedDB due to no internet" color="orange" />
    <div style="margin-top: 1rem;">
      <ag-grid-vue
        :rowData="rowData"
        :columnDefs="colDefs.column"
        :defaultColDef="defaultColDef.def"
        style="height: 500px"
        class="ag-theme-quartz"
      ></ag-grid-vue>
    </div>
  </template>
  
<script setup>
  import { ref, onMounted } from 'vue';

  import { AgGridVue } from 'ag-grid-vue3';
  import axios from 'axios';
  import { openDB } from 'idb';
  import "ag-grid-community/styles/ag-grid.css"; 
  import "ag-grid-community/styles/ag-theme-quartz.css";
  import CustomButtonComponent from "../components/CustomButtonComponent.vue"
 
  axios.defaults.baseURL = 'http://localhost:5000';
  
  const dbPromise = openDB('product-store', 1, {
    upgrade(db) {
      const store = db.createObjectStore('products', { keyPath: 'id' });
      store.createIndex('id', 'id');
    },
  });
  
  const rowData = ref([]);
  const productName = ref('');
  const quantity = ref('');
  const makerName = ref('');
  const offlineMessage = ref('');
  const defaultColDef = {
    def: { flex: 1 },
  };
 

  const addToIndexedDB = async (productData) => {
    try {
      const db = await dbPromise;
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      await store.put(productData);
      await tx.done;
    } catch (error) {
      console.error('Error adding product to IndexedDB:', error);
    }
  };
  
  const fetchFromIndexedDB = async () => {
    try {
      const db = await dbPromise;
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const products = await store.getAll();
      return products;
    } catch (error) {
      console.error('Error fetching products from IndexedDB:', error);
      return [];
    }
  };
  
  const addProductToMongoDB = async (productData) => {
    try {
      const response = await axios.post('/api/products', productData);
      console.log('Product added to MongoDB successfully');
    } catch (error) {
      console.error('Error adding product to MongoDB:', error);
    }
  };
  
  const fetchProductsFromMongoDB = async () => {
    try {
      const response = await axios.get('/api/all-products');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products from MongoDB:', error);
      return [];
    }
  };
  
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  const addProduct = async () => {
    const productData = {
      id: generateId(),
      product: productName.value,
      quantity: quantity.value,
      maker: makerName.value,
    };
  
    try {
      const isConnected = navigator.onLine;
      if (isConnected) {
        await addProductToMongoDB(productData);
      } else {
        await addToIndexedDB(productData);
        offlineMessage.value = 'This data is rendering from IndexedDB due to no internet';
      }
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const isConnected = navigator.onLine;
      if (isConnected) {
        const products = await fetchProductsFromMongoDB();
        rowData.value = products.map(item => ({
          id: item._id,
          product: item.product,
          quantity: parseInt(item.quantity),
          maker: item.maker,
          date: item.createdAt,
        }));
        offlineMessage.value = '';
        await syncIndexedDBToMongoDB(); 
      } else {
        const products = await fetchFromIndexedDB();
        rowData.value = products.map(item => ({
          id: item.id,
          product: item.product,
          quantity: parseInt(item.quantity),
          maker: item.maker,
          date: item.date,
        }));
        offlineMessage.value = 'This data is rendering from IndexedDB due to no internet';
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  const syncIndexedDBToMongoDB = async () => {
    try {
      const products = await fetchFromIndexedDB();
      for (const product of products) {
        await addProductToMongoDB(product);
      }
      console.log('IndexedDB data synchronized to MongoDB');
      await clearIndexedDB(); 
    } catch (error) {
      console.error('Error syncing IndexedDB data to MongoDB:', error);
    }
  };
  
  const clearIndexedDB = async () => {
    try {
      const db = await dbPromise;
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      await store.clear();
      await tx.done;
      console.log('IndexedDB data cleared');
    } catch (error) {
      console.error('Error clearing IndexedDB data:', error);
    }
  };
  const colDefs = {
    column: [
      { field: 'id' },
      { field: 'product', filter: 'agTextColumnFilter' },
      { field: 'quantity', filter: 'agNumberColumnFilter' },
      { field: 'maker' },
      { field: 'date', filter: 'agDateColumnFilter' },
    
      { 
      field: 'action', 
      cellRenderer: CustomButtonComponent, 
      cellRendererParams: (params) => ({ 
        rowData: params.data,
        fetchData: params.refreshCell()

      }) 
    }
    ],
  };
  
  
  onMounted(() => {
    fetchProducts();
  });
  </script>
  

  
  <style lang="scss" scoped>
 
  </style>
  
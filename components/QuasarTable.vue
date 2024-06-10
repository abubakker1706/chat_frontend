<template>
  <div>
    <div style="display: flex; flex-direction: column; gap: 1rem">
      <q-input filled v-model="productName" label="Product Name" />
      <div v-if="productNameError" class="error-message" style="color:red">{{ productNameError }}</div>
      <q-input filled v-model="quantity" label="Quantity"  />
      <div v-if="quantityError" class="error-message" style="color:red">{{ quantityError }}</div>
      <q-input filled v-model="makerName" label="Maker Name" />
     
    
      <div v-if="makerNameError" class="error-message" style="color:red">{{ makerNameError }}</div>
      <div style="margin-top: 1rem;">
        <q-btn label="Submit" type="submit" color="primary" @click="addProduct" />
      </div>
    </div>
    <div class="q-pa-md">
      <q-infinite-scroll @load="fetchMoreData" :offset="250">
    <q-table
      flat bordered
      title="Treats"
      :rows="rowData"
      :columns="columns"
      row-key="_id"
      :loading="loading"
    >
<template v-slot:body-cell-Action="props">
 
    <q-td :props=props>
      <div style="display:flex ; gap:0.5rem ">
      <q-btn icon="edit" round outline size="xs" @click="openEditDialog(props.row)" color="blue" />
      <q-btn icon="delete" round outline size="xs" @click="openDeleteDialog(props.row)" color="blue" />
      </div>
    </q-td>
    
  
</template>

    </q-table>
  </q-infinite-scroll>
  </div>
  <div v-if="dialog || confirm">
    <CustomButtonComponent 
    :default="dialog" 
    :rowData="selectedData" 
    @update:default="handleUpdateDefault" 
    @update:product="updateProduct"
    @update:confirm="handleUpdateConfirm"
    :confirm="confirm"
    @productDeleted="handleProductDeleted"
    />
  </div>
  </div>
</template>

<script setup>

import axios from 'axios';


axios.defaults.baseURL = 'http://localhost:5000';
const productName = ref('');
const quantity = ref('');
const makerName = ref('');
const rowData = ref([]);
const dialog = ref(false);
const selectedData = ref({})
const visibleRows = ref([]);
const confirm = ref(false);
const productNameError = ref('');
const quantityError = ref('');
const makerNameError = ref('');
const loading = ref(false)
const notiMessage = ref('');
const $q = useQuasar()
const showNotif = (position) => {
  $q.notify({
    message: notiMessage,
    color: 'green',
    position,
  });
};
const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/all-products');
    rowData.value = response.data.data.map(product => ({ ...product, selected: false }));
  } catch (error) {
    console.error('Error fetching data:', error);
  }finally{
    loading.value = false
  }
};
const openEditDialog = (r) => {
  console.log(r,"r")
  selectedData.value = r;
  dialog.value = true;
 
  
};
const openDeleteDialog =(r)=>{
  console.log(r,"from delete")
  selectedData.value = r;
  confirm.value = true;
}
const handleUpdateDefault=(value)=>{
  console.log(value,"value for dialog")
  dialog.value = value
}
const handleUpdateConfirm =(value)=>{
  console.log(value,"value for dialog")
  confirm.value = value
}
const updateProduct = (product) => {
  console.log(product, "product");
  console.log(rowData.value, "row data value");
  
  rowData.value = rowData.value.map(row => {
    if (row._id === product._id) {
      return product;
    } else {
      return row;
    }
  });
};
const handleProductDeleted=(deletedProduct)=>{
      
      rowData.value = rowData.value.filter(product => product._id !== deletedProduct._id);
    }
const columns = [
  {
    name: 'Id',
    required: true,
    label: 'Id',
    align: 'left',
    field: '_id',
    format: val => `${val}`,
    sortable: true
  },
  { name: 'Product', align: 'left', label: 'Product', field: 'product', sortable: true },
  { name: 'Quantity', label: 'Quantity', field: 'quantity', sortable: true, align: 'left' },
  { name: 'Maker', label: 'Maker', field: 'maker', align: 'left' },
  { name: 'Date', label: 'Date', field: 'createdAt', align: 'left' },
  { name: 'Action', label: '', field: 'action', align: 'left', sortable: false },
];
const addProduct = async () => {

  productNameError.value = '';
  quantityError.value = '';
  makerNameError.value = '';
  loading.value = true
  try {
    const productData = {
      product: productName.value,
      quantity: quantity.value,
      maker: makerName.value,
    };

    const response = await axios.post('/api/products', productData);
    console.log(response.data.msg, "response");

    fetchData()
    notiMessage.value = response.data.msg
    showNotif('top-right');
  } catch (error) {
    if (error.response && error.response.data) {
      const errors = error.response.data;
         console.log(errors.error.product,"erross")
   
      if (errors.error.product) {
        productNameError.value = errors.error.product;
      }
      if (errors.error.quantity) {
        quantityError.value = errors.error.quantity;
      }
      if (errors.error.maker) {
        makerNameError.value = errors.error.maker;
      }
    } else {
    
      console.error('Error adding product:', error);
    }
  }finally{
    loading.value = false
   
  }
};

const fetchMoreData = async () => {
 
  const newRows = rowData.value.slice(visibleRows.value.length, visibleRows.value.length + 5);
  visibleRows.value = [...visibleRows.value, ...newRows];
};

onMounted(() => {
  fetchData();
});


</script>

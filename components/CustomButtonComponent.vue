<template>
  <div class="q-pa-md q-gutter-sm">
    
    <q-dialog v-model="default">
      <q-card>
        <q-card-section>
          <div class="text-h6">Product Details</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div>
       
            <p>Product Name: {{ productdetails.product }}</p>
            <p>Quantity: {{ productdetails.quantity }}</p>
            <p>Maker: {{ productdetails.maker }}</p>
            <p>Date: {{ productdetails.createdAt }}</p>
            <hr>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Edit" @click="openEditDialog" />
          <q-btn flat label="Close" v-close-popup  @click="closePopup" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="secondDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card class="bg-white text-black" style="width: 300px">
        <q-card-section>
          <div class="text-h6">Edit Details</div>
        </q-card-section>

        <div style="display: flex; flex-direction: column; gap: 1rem">
          <q-input filled v-model="editProductName" label="Product Name" />
          <q-input filled v-model="editQuantity" label="Quantity" />
          <q-input filled v-model="editMakerName" label="Maker Name" />
          
        </div>

        <q-card-actions align="right" class="bg-white text-black">
          <q-btn label="Save" type="submit" color="primary" @click="editProduct" />
          <q-btn flat label="Close" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
   
     
      <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="closeDeletePopup" />
          <q-btn flat label="Yes" color="primary" v-close-popup @click="deleteProduct" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { defineComponent, ref,onMounted,defineEmits} from "vue";
import axios from "axios";
import { useQuasar } from 'quasar'
export default defineComponent({
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    
    default:{
      type: Boolean,
      required: true,
    },
    confirm:{
      type: Boolean,
      required: true,
    }
  },
  
  setup(props,{ emit }) {
    axios.defaults.baseURL = 'http://localhost:5000';
    // const emits = defineEmits()
    const inception = ref(false);
    const secondDialog = ref(false);
    const productdetails = ref(null);
  
   console.log(props.confirm,"confirm")
    const editProductName = ref('');
    const editQuantity = ref('');
    const editMakerName = ref('');
    const notiMessage = ref("");
    const $q = useQuasar()
    const showNotif = (position) => {
  $q.notify({
    message: notiMessage,
    color: 'green',
    position,
  });
};
productdetails.value = props.rowData,
console.log(props.rowData,"Product details")
const closePopup = () => {
  const newValue = false; 
  console.log('Emitting update:default event with value:', newValue);
  emit('update:default', newValue); 
};
const closeDeletePopup = () => {
  const newValue = false; 
  console.log('Emitting update:default event with value:', newValue);
  emit('update:confirm', newValue); 
};



    
    const openEditDialog = () => {
     
      editProductName.value = productdetails.value.product;
      editQuantity.value = productdetails.value.quantity;
      editMakerName.value = productdetails.value.maker;
      secondDialog.value = true;
    };

    const editProduct = async () => {
  try {
    const updatedProduct = {
      id: productdetails.value._id,
      product: editProductName.value,
      quantity: editQuantity.value,
      maker: editMakerName.value
    };

    const response = await axios.put(`/api/products/${updatedProduct.id}`, updatedProduct);
    console.log(response,"edit response ")
    productdetails.value= response.data.data
   
    notiMessage.value = response.data.message;
    emit("update:product", productdetails.value)
    // Show notification
    showNotif('top-right');
    secondDialog.value = false; 
    
    // await fetchProductsFromMongoDB()
  } catch (error) {
    console.error('Error editing product:', error);
  }
};
const deleteProduct = async () => {
  try {
    const response = await axios.delete(`/api/delete-product/${productdetails.value._id}`);
    console.log(response.data.message, "delete response ");
    notiMessage.value = response.data.message;
    showNotif('top-right');
    emit('productDeleted', productdetails.value);
    closeDeletePopup()
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

    return {
      inception,
      secondDialog,
      productdetails,
      editProductName,
      editQuantity,
      editMakerName,
      // buttonClicked,
      openEditDialog,
      editProduct,
      // deleteButtonClicked ,
      deleteProduct,
      showNotif,
      closeDeletePopup,
      closePopup
      // fetchProductsFromMongoDB
     
    };
  }
});
</script>

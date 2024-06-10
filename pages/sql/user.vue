<template>
    <div>
      <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="closeDeletePopup" />
          <q-btn flat label="Yes" color="primary" v-close-popup @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
    <div class="q-pa-md">
        <div class="q-gutter-y-md" 
      style="
      max-width: 100% ;
       background-color:#F5F5F5;
       display:flex;
       justify-content:flex-start ;
       align-items:flex-start">
      <q-tabs
        v-model="tab"
        class="text-blue"
      >
        <q-tab name="user"  label="User" @click="navigateTo('/sql/user')" />
        <q-tab name="task"  label="task" @click="navigateTo('/sql/task')"/>
      
      </q-tabs>
    </div>
      <q-table
        class="my-sticky-dynamic"
        flat bordered
        title="Users"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="user_id"
      
   
      >
      <template v-slot:top-right>
        <div style="display: flex;gap:1rem">
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn round color="primary" icon="add"  size="0.8rem" @click="prompt = true;">
          <q-tooltip class="bg-blue">Add User</q-tooltip>
        </q-btn>
      </div>
      </template>
      <template v-slot:body-cell-Action="props">
 
 <q-td :props=props>
   <div style="display:flex ; gap:0.5rem ">
   <q-btn icon="edit" round outline size="xs" @click="openEditDialog(props.row)" color="blue" />
   <q-btn icon="delete" round outline size="xs" @click="openDeleteDialog(props.row)" color="blue" />
   </div>
 </q-td>
 

</template>
    
    </q-table>
    </div>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" v-if="isEdit==false">Add User</div>
          <div class="text-h6" v-else>Update User</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="firstname" autofocus @keyup.enter="prompt = false" placeholder="Firstname"/>
          <q-input dense v-model="lastname" autofocus @keyup.enter="prompt = false" placeholder="Lastname"/>
          <q-input dense v-model="email" autofocus @keyup.enter="prompt = false" placeholder="Email"/>
          <q-input dense v-model="age" autofocus @keyup.enter="prompt = false" placeholder="Age"/>
          <q-input dense v-model="date" mask="date" :rules="['date']" placeholder="Date of birth">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="date">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup @click="closePopup" />
          <q-btn flat label="Save"  @click="addUser"  v-if="isEdit=== false" />
          <q-btn flat label="Update"  @click="editUser" v-else/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script>
  import { ref, computed, nextTick } from 'vue'
  import { useRouter } from 'vue-router';
  import axios from 'axios';


axios.defaults.baseURL = 'http://localhost:8080';
  const router = useRouter();

const navigateTo = (route) => {
  router.push(route);
};
  const columns = [
    {
      name: 'index',
      label: 'User Id',
      field: 'user_id',
      align: 'left'
    },
    {
      name: 'username',
      required: true,
      label: 'User name',
      align: 'left',
      field: row => row.firstname + ' ' + row.lastname,
      format: val => val,
      sortable: true
    },
    { name: 'age',  align: 'left', label: 'Age', field: 'age', sortable: true },
    { name: 'email', label: 'Email', field: 'email', sortable: true , align: 'left'},
    { name: 'dob', label: 'Date of birth', field: 'dob' , align: 'left'},
    { name: 'Action', label: '', field: 'action', align: 'left', sortable: false },
  ]
  
  
  
 
  
  export default {
    setup () {
      const nextPage = ref(2)
      const loading = ref(false)
      const prompt =ref(false)
      const date = ref(" ")
    
      const rows = ref([])
      const firstname=ref("")
      const lastname=ref("")
      const email=ref("")
      const age=ref("")
      const isEdit = ref(false)
    const selectedData=ref({})
    const confirm = ref(false)
    const notiMessage = ref('');
const $q = useQuasar()
const showNotif = (position) => {
  $q.notify({
    message: notiMessage,
    color: 'green',
    position,
  });
};
     console.log(isEdit.value,"isEdit")
    const openEditDialog = (r) => {
  console.log(r,"r")
  selectedData.value = r;
  prompt.value = true;
  isEdit.value = true;
    if(isEdit){
      firstname.value=r.firstname
      lastname.value=r.lastname
      email.value=r.email
      age.value=r.age
      date.value=r.dob
    }
};
const openDeleteDialog=(r)=>{
  selectedData.value = r;
  confirm.value = true;
}
    const closeDeletePopup =()=>{
      confirm.value=false
    }
      const addUser = async() => {
            const userData ={
              firstname:firstname.value,
              lastname:lastname.value,
              email:email.value,
              age:age.value,
              dob:date.value,
            }
          try {
            const response = await axios.post('/api/users/add-user',userData)
            console.log(response.data.message,"message")
            fetchAllUsers()
            notiMessage.value = response.data.message
    showNotif('top-right');
          } catch (error) {
            console.log(error)
          }finally{
            prompt.value=false
            isEdit.value=false
            firstname.value=""
            lastname.value=""
            email.value=""
            age.value=""
            date.value=""
          }
      }

      const editUser = async() => {
        const userData ={
              firstname:firstname.value,
              lastname:lastname.value,
              email:email.value,
              age:age.value,
              dob:date.value,
            }
            console.log(selectedData.value.user_id,"selectedData")
          try {
            const response = await axios.put(`/api/users/update-user/${selectedData.value.user_id}`,userData)
            console.log(response.data)
            fetchAllUsers()
            notiMessage.value = response.data.message
           showNotif('top-right');
          } catch (error) {
            console.log(error)
          }finally{
            prompt.value=false
            isEdit.value=false
            firstname.value=""
            lastname.value=""
            email.value=""
            age.value=""
            date.value=""
          }

      }
      const fetchAllUsers = async() =>{
        try {
          const response = await axios.get('/api/users/get-all-user')
         
          console.log(response.data,"Fetch all users")
          rows.value=response.data
        } catch (error) {
          console.log(error)
        }
      }
      const deleteUser = async() =>{
        try {
            const response = await axios.delete(`/api/users/delete-user/${selectedData.value.user_id}`)
            console.log(response.data)
            fetchAllUsers()
            notiMessage.value = response.data.message
           showNotif('top-right');
        } catch (error) {
          console.log(error)
        }
      }
      const closePopup=()=>{
        prompt.value=false
        isEdit.value=false
        firstname.value=""
        lastname.value=""
        email.value=""
        age.value=""
        date.value=""
      }
      onMounted(() => {
      fetchAllUsers()
    })
      return {
        columns,
        rows,
        deleteUser,
        confirm,
        prompt,
        nextPage,
        loading,
        date,
        fetchAllUsers,
        firstname,
        lastname,
        email,
        age,
        closeDeletePopup,
        openDeleteDialog,
       addUser,
        pagination: { rowsPerPage: 0 },
        openEditDialog,
        closePopup,
        isEdit,
        editUser
     
      }
    }
  }
  </script>
  
  <style lang="sass">
  .my-sticky-dynamic
    /* height or max-height is important */
    height: 600px
  
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th /* bg color is important for th; just specify one */
      background-color: white
  
    thead tr th
      position: sticky
      z-index: 1
    /* this will be the loading indicator */
    thead tr:last-child th
      /* height of all previous header rows */
      top: 48px
    thead tr:first-child th
      top: 0
  
    /* prevent scrolling behind sticky top row on focus */
    tbody
      /* height of all previous header rows */
      scroll-margin-top: 48px
  </style>
  
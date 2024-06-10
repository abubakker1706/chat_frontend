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
          <q-btn flat label="Yes" color="primary" v-close-popup @click="deleteTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
    <div>
      <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" v-if="isEdit==false">Add Task</div>
          <div class="text-h6" v-else>Update Task</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="task" autofocus @keyup.enter="prompt = false" placeholder="Task"/>
          <q-input dense v-model="description" autofocus @keyup.enter="prompt = false" placeholder="Task Description"/>
          
        
  
      <q-select
        dense
        :model-value="model"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @input-value="setModel"
       
        placeholder="Assign To"
        style="width: 350px; padding-bottom: 32px"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

 

     
    <q-input dense v-model="date">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="date" mask="YYYY-MM-DD HH:mm">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time v-model="date" mask="YYYY-MM-DD HH:mm" format24h>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat/>
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
 
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup   @click="closePopup" />
        
          <q-btn flat label="Save"  @click="addTask"  v-if="!isEdit"  />
          <q-btn flat label="Update"  @click="editTask" v-else/>
       
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
 
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
   
  
    <div class="q-pa-md"  style="display: flex;gap:1rem;flex: 1;">
      <div >
    <q-table
      flat bordered
      title="Task"
      :rows="rows"
      :columns="columns"
      row-key="task_id"
     
     
      style="border: 0.5px solid lightgrey; width: 100%;height: 600px;">
      <template v-slot:top-right>
        <div style="display: flex; gap: 1rem">
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn round color="primary" icon="add" size="0.8rem" @click="openAddDialog">
            <q-tooltip class="bg-blue">Add Task</q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-slot:body-cell-action="props">
 
 <q-td :props=props>
   <div style="display:flex ; gap:0.5rem ">
   <q-btn icon="edit" round outline size="xs" @click="openEditDialog(props.row)" color="blue" />
   <q-btn icon="delete" round outline size="xs" @click="openDeleteDialog(props.row)" color="blue" />
   </div>
 </q-td>
 

</template>
    </q-table>
  </div>
   <div style="flex: 1;background-color: #F5F5F5;">
    <calendar :rowData="rows"/>
  </div>

  </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  const router = useRouter();
  axios.defaults.baseURL = 'http://localhost:8080';

const navigateTo = (route) => {
  router.push(route);
};
const stringOptions = [
  'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
].reduce((acc, opt) => {
  for (let i = 1; i <= 5; i++) {
    acc.push(opt + ' ' + i)
  }
  return acc
}, [])
  
const columns = [
  { name: 'task', required: true, label: 'Task', align: 'left', field: row => row.task, format: val => `${val}`, sortable: true },
  { name: 'description', align: 'left', label: 'Task Description', field: 'description', sortable: true },
  { name: 'assignTo', label: 'Assign To', field: row => `${row.firstName} ${row.lastName}`, sortable: true , align: 'left'},
  { name: 'taskDate', label: 'Task Date', field: 'taskDate' , align: 'left',},
  { name: 'action', label: '', field: 'action', align: 'left', sortable: false }
];

  

  
  export default {
    setup () {
      const prompt = ref(false)
      const task = ref("")
      const description = ref("")
      const date = ref("")
     
      const model = ref(null)
    const options = ref([])
    const userData = ref([])
   const assignTo = ref(null)
   const rows = ref([])
   const selectedData = ref(null)
   const confirm = ref(false)
   const isEdit = ref(false)
   const notiMessage = ref('');
   console.log(isEdit.value,"editvalue")
const $q = useQuasar()
const showNotif = (position) => {
  $q.notify({
    message: notiMessage,
    color: 'green',
    position,
  });
};
    const fetchAllUsers = async() =>{
        try {
          const response = await axios.get('/api/users/get-all-user')
         
          console.log(response.data,"Fetch all users")
          userData.value=response.data
          options.value = response.data.map(user => ({ label: user.firstname, value: user.user_id }))
        } catch (error) {
          console.log(error)
        }
      }
    const addTask = async ()=>{
         const taskData ={
          task:task.value,
          description:description.value,
          taskDate:date.value,
          assignTo:assignTo.value
         }
      try {
        const response = await axios.post("/api/tasks/add-tasks",taskData)
        console.log(response.data,"Add Task")
        fetchAllTask()
        notiMessage.value = response.data.message
    showNotif('top-right');
    closePopup()
    
      } catch (error) {
        console.log(error,"error add task")
      }
         
    }
    const openAddDialog=()=>{
      prompt.value = true
      isEdit.value = false

      console.log(isEdit.value,"inadddialog")
    }
    const fetchAllTask = async ()=>{
      try {
        const response = await axios.get('/api/tasks/get-all-tasks')
        console.log(response.data,"Fetch all tasks")
        rows.value=response.data
      } catch (error) {
        console.log(error)
      }
    }
    const openDeleteDialog=(r)=>{
  selectedData.value = r;
  confirm.value = true;
}
    const closeDeletePopup =()=>{
      confirm.value=false
    }
    const deleteTask = async() =>{
        try {
            const response = await axios.delete(`/api/tasks/delete-tasks/${selectedData.value.task_id}`)
            console.log(response.data)
            fetchAllTask()
            notiMessage.value = response.data.message
           showNotif('top-right');
        } catch (error) {
          console.log(error)
        }
      }
  const editTask = async() =>{
    const taskData ={
          task:task.value,
          description:description.value,
          taskDate:date.value,
          assignTo:assignTo.value
         }
    try {
        const response = await axios.put(`/api/tasks/update-tasks/${selectedData.value.task_id}`,taskData)
        console.log(response.data,"Edit Task")
        fetchAllTask()
        notiMessage.value = response.data.message
    showNotif('top-right');
    closePopup()
    } catch (error) {
      console.log(error)
    }
  }
      const openEditDialog = (r) => {
  console.log(r,"r")
  selectedData.value = r;
  prompt.value = true;
  isEdit.value = true;
  console.log(isEdit.value,"editvalue in edit dialog")
    if(isEdit.value == true){
      task.value=r.task
      description.value=r.description
      model.value=r.firstName
      assignTo.value=r.assignTo
      date.value =r.taskDate
      // email.value=r.email
      // age.value=r.age
      // date.value=r.dob
    }
};
const closePopup=()=>{
        prompt.value=false
        isEdit.value=false
        task.value=""
        description.value=""
        model.value=""
        assignTo.value=null
        date.value=""
      }
    onMounted(() => {
      fetchAllUsers()
      fetchAllTask()
    })
      return {
        filter: ref(''),
        columns,
        closePopup,
        editTask,
        rows,
        prompt,
        task,
        description,
        date,
        openAddDialog,
        openEditDialog,
   
        model,
        options,
        userData,
        addTask,
        confirm,
        deleteTask,
        openDeleteDialog,
        closeDeletePopup,
      
        fetchAllTask,
        isEdit,
      
       
      //   filterFn (val, update, abort) {
      //   update(() => {
      //     const needle = val.toLocaleLowerCase()
      //     options.value = stringOptions.filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
      //   })
      // },

      setModel (val) {
        console.log(val,"set model")
        console.log(options.value,"option")
        const selectedOption = options.value.find(v => v.label === val);

        console.log(selectedOption, "selected option");
        console.log(selectedOption,"selected option")
        if(selectedOption){
          model.value = val
          assignTo.value = selectedOption.value
        }
     
      }
      }
    }
  }
  </script>
  
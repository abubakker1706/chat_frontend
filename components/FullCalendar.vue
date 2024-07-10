<template>
    <div class='demo-app'>
      <div class='demo-app-sidebar'>
        <div class='demo-app-sidebar-section'>
          <h2>Instructions</h2>
          <ul>
            <li>Select dates and you will be prompted to create a new event</li>
            <li>Drag, drop, and resize events</li>
            <li>Click an event to delete it</li>
          </ul>
        </div>
        <div class='demo-app-sidebar-section' v-if="calendarOptions">
          <label>
            <input
              type='checkbox'
              :checked='calendarOptions.weekends'
              @change='handleWeekendsToggle'
            />
            toggle weekends
          </label>
        </div>
        <div class='demo-app-sidebar-section'>
          <h2>All Events ({{ displayedEvents.length }})</h2>
          <ul>
            <li v-for='event in displayedEvents' :key='event._id'>
              <b>{{ event.startStr }}</b>
              <i>{{ event.title }}</i>
            </li>
          </ul>
        </div>
      </div>
      <div class='demo-app-main'>
        
        <FullCalendar
          class='demo-app-calendar'
          :options='calendarOptions'
        >
          <template v-slot:eventContent='arg'>
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </template>
          <template #header>
    <h1>Here might be a page title</h1>
  </template>
         
        </FullCalendar>
        
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import axios from "axios"
  
  let eventGuid = 0
  let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today
  axios.defaults.baseURL = 'http://localhost:5000';
  const notiMessage = ref('');
  const displayedEvents = ref([]);
const $q = useQuasar()
const showNotif = (position) => {
  $q.notify({
    message: notiMessage,
    color: 'green',
    position,
  });
};
const eventRestrictions = {
  'Daily meeting': {
    '2024-07-10': [
      { start: 23, end: 23 }, 
      { start: 9, end: 10 },   
    ],
  },
  'Learn DSA': {
    '2024-07-10': [
      { start: 10, end: 11 }, 
      { start: 23, end: 23 }, 
    ],
  },
  'Team meeting': {
    '2024-05-29': [
      { start: 12, end: 13 }, 
    ],
  },
};
function isTimeRestricted(eventTitle, date, hour) {
  const restrictions = eventRestrictions[eventTitle]?.[date];
  if (!restrictions) {
    return false;
  }
  
  return restrictions.some(range => hour >= range.start && hour <= range.end);
}


  const INITIAL_EVENTS = [
    {
      id: createEventId(),
      title: 'All-day event',
      start: todayStr
    },
    {
      id: createEventId(),
      title: 'Timed event',
      start: todayStr + 'T12:00:00'
    }
  ]
  
  function createEventId() {
    return String(eventGuid++)
  }
 
  const currentEvents = ref([])
  const calendarOptions = ref({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin // needed for dateClick
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    // initialEvents:INITIAL_EVENTS,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: handleDateSelect,
    eventClick: handleEventClick,
    eventsSet: handleEvents,
    eventDrop: handleEventDrop,
    datesSet: handleDatesSet,
    events: currentEvents.value,
    eventOrder: (a, b) => {
    const today = new Date().toISOString().split('T')[0];
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    const isAToday = aStart.toISOString().split('T')[0] === today;
    const isBToday = bStart.toISOString().split('T')[0] === today;
    if (isAToday && !isBToday) {
      return -1;
    } else if (!isAToday && isBToday) {
      return 1;
    } else {
      return aStart - bStart;
    }
  },
  
  })
  function getColorForEvent(title) {
  switch (title.toLowerCase()) {
    case 'daily meeting':
      return '#ff9f89';
    case 'learn dsa':
      return '#6ec1e4';
    case 'team meeting':
      return '#a1e48b';
    default:
      return '#9e9e9e'; 
  }
}
  
  
  function handleWeekendsToggle() {
    calendarOptions.value.weekends = !calendarOptions.value.weekends // update a property
  }
  
  function handleDateSelect(selectInfo) {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar
  
    calendarApi.unselect() // clear date selection
  
    if (title) {
        const color = getColorForEvent(title);
        const event = {
            // id: createEventId(),
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            backgroundColor: color,
      borderColor: color,
          
        }
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: color,
      borderColor: color,
       
      })
      addEvent(event)
    
    }
    
  }
  

// async function handleEventClick  (clickInfo) {
//     const id = clickInfo.event._def.extendedProps._id
//     console.log(id ,"iddd")
//   if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
//     try {
//       const response = await axios.delete(`/api/delete-event/${id}`)
//       console.log(response.data,"delete event")
//       notiMessage.value = response.data.message
//        showNotif('top-right');
//       clickInfo.event.remove()
//       console.log(currentEvents.value,"current event from delete ")
//     //   currentEvents.value = currentEvents.value.filter(event => event._id !== id )
//     } catch (error) {
//       console.error('Error deleting event:', error)
//     }
//   }
// }
async function handleEventClick(clickInfo) {
  const id = clickInfo.event._def.extendedProps._id;
  const newTitle = prompt('Please enter a new title for your event', clickInfo.event.title);

  if (newTitle !== null) {
    const color = getColorForEvent(newTitle);
    const updatedEvent = {
      id,
      title: newTitle,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      allDay: clickInfo.event.allDay,
      backgroundColor: color,
      borderColor: color,
    };

    try {
      await updateEvent(updatedEvent);
      clickInfo.event.setProp('title', newTitle);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  } else if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
    try {
      const response = await axios.delete(`/api/delete-event/${id}`);
      console.log(response.data,"delete event")
      notiMessage.value= response.data.message
      showNotif('top-right');
      clickInfo.event.remove();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }
}



  

function handleEvents(events){
  console.log(currentEvents.value,"current events")
   console.log(events,"events")
//   const existingEventIndex = currentEvents.value.findIndex(e => e._id === events._def.extendedProps._id);
//   console.log(existingEventIndex,"existingEventIndex")
  currentEvents.value = events.map(event => ({
    id: event._def.extendedProps._id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: getColorForEvent(event.title),
    borderColor: getColorForEvent(event.title),
  }))
}

  const addEvent = async(event)=>{
    console.log(event,"event")
     try {
        const reponse = await axios.post("/api/add-event",event)
        console.log(reponse.data,"response for add event")
        currentEvents.value.push(reponse.data.data)
        calendarOptions.value.events = currentEvents.value
        notiMessage.value = reponse.data.messgae
       showNotif('top-right');
       fetcAllTask()
     } catch (error) {
        console.log(error)
     }
  }
  const updateEvent = async (event) => {
  try {
    const response = await axios.put(`/api/update-event/${event.id}`, event);
    console.log("Event updated:", response.data);
    notiMessage.value = response.data.message
       showNotif('top-right');
  } catch (error) {
    console.error("Error updating event:", error);
  }
};
async function handleEventDrop(info){
    console.log(info,'drop info')
    const eventStartDate = info.event.start.toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
  const eventStartHour = info.event.start.getHours(); // Extract hour

  if (isTimeRestricted(info.event.title, eventStartDate, eventStartHour)) {
    alert(`${eventStartHour}:00 is a restricted time for the ${info.event.title} event on ${eventStartDate}.`);
    info.revert();
    return;
  }
  const updatedEvent = {
    id: info.event._def.extendedProps._id,
    title: info.event.title,
    start: info.event.start,
    end: info.event.end,
    allDay: info.event.allDay,
    backgroundColor: getColorForEvent(info.event.title),
    borderColor: getColorForEvent(info.event.title),
  };

  try {
    await updateEvent(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    info.revert(); // revert the change if the update fails
  }
};
function handleDatesSet(info) {
  const { start, end } = info;
  displayedEvents.value = currentEvents.value.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : eventStart;
    return eventStart >= start && eventEnd <= end;
  });
}

  const fetcAllTask = async()=>{
    try {
        const response = await axios.get('/api/get-event')
    console.log(response.data.data,"all events")
    currentEvents.value = response.data.data
    currentEvents.value.forEach(event => {
      event.backgroundColor = getColorForEvent(event.title);
      event.borderColor = getColorForEvent(event.title);
    });
    calendarOptions.value.events = currentEvents.value
    } catch (error) {
        console.error('Error fetching events:', error)
    }
  }

  
  onMounted(() => {
     fetcAllTask()
    
})
  </script>
  


  <style lang='css'>

  h2 {
    margin: 0;
    font-size: 16px;
  }
  
  ul {
    margin: 0;
    padding: 0 0 0 1.5em;
  }
  
  li {
    margin: 1.5em 0;
    padding: 0;
  }
  
  b { /* used for event dates/times */
    margin-right: 3px;
  }
  
  .demo-app {
    display: flex;
    min-height: 100%;
    font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
    font-size: 14px;
  }
  
  .demo-app-sidebar {
    width: 300px;
    line-height: 1.5;
    background: #eaf9ff;
    border-right: 1px solid #d3e2e8;
  }
  
  .demo-app-sidebar-section {
    padding: 2em;
  }
  
  .demo-app-main {
    flex-grow: 1;
    padding: 3em;
  }
  
  .fc { /* the calendar root */
    max-width: 1100px;
    margin: 0 auto;
  }
  
  </style>
  
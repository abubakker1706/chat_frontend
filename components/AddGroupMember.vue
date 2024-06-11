<template>
    <div class="q-pa-md">
      <q-select
        filled
        v-model="model"
        use-input
        use-chips
        multiple
        input-debounce="0"
        @new-value="createValue"
        :options="filterOptions"
        @filter="filterFn"
        style="width: 250px"
      />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export const stringOptions = [
    'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
  ]
  
  export const filterOptions = ref(stringOptions)
  export const model = ref(null)
  
  export function createValue(val, done) {
    if (val.length > 0) {
      if (!stringOptions.includes(val)) {
        stringOptions.push(val)
      }
      done(val, 'toggle')
    }
  }
  
  export function filterFn(val, update) {
    update(() => {
      if (val === '') {
        filterOptions.value = stringOptions
      }
      else {
        const needle = val.toLowerCase()
        filterOptions.value = stringOptions.filter(
          v => v.toLowerCase().indexOf(needle) > -1
        )
      }
    })
  }
  </script>
  
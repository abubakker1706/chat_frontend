
import { defineStore } from "pinia";
import {ref} from "vue"


export const useCounterStore = defineStore("counter",()=>{

    const count = ref(0)

    const increase =()=>{
         count.value ++
       
    }
    const decrease = ()=>{
          count.value --
    }

    return{
        increase,
        decrease,
        count
    }





})
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "nuxt-quasar-ui",
   
  ],
  css: [
    
    "@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass",
    "@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass",
    "@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass",
  ],
  quasar: {
    plugins: [
      "BottomSheet",
      "Dialog",
      "Loading",
      "LoadingBar",
      "Notify",
      "Dark",
    ],
    extras: {
      font: "roboto-font",
      fontIcons: ["material-icons"],
    },
  },
ssr:false,
plugins: [
  '~/plugins/pinia.js',
  '~/plugins/focus.js',
 
],
router: {
  middleware: ['auth'],
},


})

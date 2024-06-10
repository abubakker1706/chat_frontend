<template>
    <div>


         <ul>
            <li>
               <NuxtLink :to="`/product/${product.id}`"> {{ product.title }}</NuxtLink>
            </li>
         </ul>
        
    </div>
</template>

<script setup>
const {product} =defineProps(["product"])


</script>

<style lang="scss" scoped>

</style>
<template>
    <div>
        List of products
        <div v-for="p in products">
        <ProductCard  :product ="p"/>
    </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'product'
})
const {data:products}=useFetch("https://fakestoreapi.com/products")
</script>

<style lang="scss" scoped>

</style>
<template>
  <div>
    Product details for {{ id }}
    <img :src="singleProduct?.image" alt="Product details for {{ id }}" style="height: 100px; width: 100px;"/>
    <p>
    {{ singleProduct.title }}
    </p>
    <p>
    {{ singleProduct.price}}
    </p>
  </div>
</template>

<script setup>

const {id} = useRoute().params
definePageMeta({
    layout: 'product'
})
const uri = "https://fakestoreapi.com/products/"+id
const {data:singleProduct}= useFetch(uri)
console.log(singleProduct,'singleProduct')
</script>

<style lang="scss" scoped></style>

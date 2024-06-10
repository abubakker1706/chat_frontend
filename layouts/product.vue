<template>
    <div>

        <header>
            <nav>
                <ul  style="display: flex;gap: 2rem ">
                    <NuxtLink to="/product">Abu Product</NuxtLink>
                   
                </ul>
            </nav>
        </header>
    </div>                                          
    <div>
        <slot/>
    </div>
    <footer>
        <nav>
                <ul  style="display: flex;gap: 2rem ">
                    <NuxtLink to="/">Home</NuxtLink>
                    <NuxtLink to="/about">About</NuxtLink>
                    <NuxtLink to="/product">Product</NuxtLink>
                </ul>
            </nav>
    </footer>
</template>


<template>
    <div v-if="Object.keys(userObject).length" :style="{ width: '100%', height: '100vh' }">
        <CometChatConversationsWithMessages />
    </div>
    <CometChatUsersWithMessages :usersConfiguration="usersConfiguration"
></CometChatUsersWithMessages>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CometChatConversationsWithMessages, CometChatUsers, CometChatUIKit } from '@cometchat/chat-uikit-vue';
import "@cometchat/chat-uikit-vue/dist/style.css";
import { UIKitSettingsBuilder, CometChatOption } from "@cometchat/uikit-shared";

const COMETCHAT_CONSTANTS = {
    APP_ID: "258627433d076579",
    REGION: "IN",
    AUTH_KEY: "b3b6c531d3460b7a91e5f343d1f4f7f9d02f5218",
};
const userObject = ref('');

onMounted(async () => {
    const UIKitSettings = new UIKitSettingsBuilder()
        .setAppId(COMETCHAT_CONSTANTS.APP_ID)
        .setRegion(COMETCHAT_CONSTANTS.REGION)
        .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
        .subscribePresenceForAllUsers()
        .build();

    await CometChatUIKit.init(UIKitSettings);
    const user = await CometChatUIKit.getLoggedinUser();
    if (user) {
        userObject.value = user;
    } else {
        const UID = "superhero2";
        const loggedInUser = await CometChatUIKit.login(UID, COMETCHAT_CONSTANTS.AUTH_KEY);
        userObject.value = loggedInUser;
    }
});

const usersConfiguration:UsersConfiguration = new UsersConfiguration({
disablePresence:true
});

</script>

<style lang="scss" scoped>

</style>

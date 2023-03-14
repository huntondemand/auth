<template>
  <div>
    <h1>Home</h1>
    <button @click="fetchUser">
      Fetch user
    </button>
    <button @click="handleLogout">
      Logout
    </button>
    <p>User</p>
    <p>{{ user?.id || 'id' }}</p>
    <p>{{ user?.email || 'email' }}</p>
    <img
      :src="pictureUrl"
      height="40"
    >

    <form @submit.prevent="handleChangePassword">
      <label for="current-password">Current password</label>
      <input
        id="current-password"
        v-model="currentPassword"
      >
      <label for="newt-password">New password</label>
      <input
        id="new-password"
        v-model="newPassword"
      >
      <button type="submit">
        Change password
      </button>
    </form>
    <button @click="refreshAccessToken">
      refreshAccessToken
    </button>
    <pre>Login: {{ isLoggedIn }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useAuth, definePageMeta, useAuthSession, useLoggedIn, computed, ref } from '#imports';



definePageMeta({ middleware: "auth" })

const { logout, fetchUser, changePassword } = useAuth()
const { useUser, refreshAccessToken } = useAuthSession()
const user = useUser()
const isLoggedIn = useLoggedIn()
const pictureUrl = computed(() => 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png')

async function handleLogout() {
  await logout()
}

const currentPassword = ref("")
const newPassword = ref("")

async function handleChangePassword() {
  await changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  })
}
</script>

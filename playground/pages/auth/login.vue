<template>
  <div>
    <h1>Login</h1>
    <button @click="handleLogin">
      Login
    </button>
    <button @click="handleRequestPasswordReset">
      Forgot password
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports';


const { login, requestPasswordReset } = useAuth()

async function handleLogin() {
  const data = await login({ email: "dwinkelmann@outlook.com", password: "huntondemand" })
  console.log('handleLogin: ', data);
}
async function handleRequestPasswordReset() {
  const { error } = await requestPasswordReset("becem.gharbi96@gmail.com")
  console.log(error.value?.data?.message)
}
</script>

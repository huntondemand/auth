export default defineNuxtConfig({
  modules: ['../src/module'],
  auth: {
    baseUrl: 'https://agw.hunt-on-demand.com',
    cookieOptions: {
      name: 'hod'
    },
    redirect: {
      login: "/auth/login",
      logout: "/auth/login",
      home: "/home",
      callback: "/auth/callback",
      passwordReset: "/auth/password-reset",
      emailVerify: "/auth/email-verify",
    },
  }
})

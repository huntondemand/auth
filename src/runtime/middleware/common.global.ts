import { defineNuxtRouteMiddleware, useRuntimeConfig, navigateTo } from "#app";

export default defineNuxtRouteMiddleware((to) => {
  const publicConfig = useRuntimeConfig().public.auth;

  if (
    to.path === publicConfig.redirect.login ||
    to.path === publicConfig.redirect.callback
  ) {
    const accessToken = useAccessToken();
    if (accessToken.value) {
      return navigateTo(publicConfig.redirect.home);
    }
  }
});

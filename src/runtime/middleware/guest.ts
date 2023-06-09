import { defineNuxtRouteMiddleware, useRuntimeConfig, navigateTo } from "#imports";
import { useAccessToken } from '../composables/useAccessToken'
export default defineNuxtRouteMiddleware((to) => {
  const publicConfig = useRuntimeConfig().public.auth;

  if (
    to.path === publicConfig.redirect.login ||
    to.path === publicConfig.redirect.callback
  ) {
    return;
  }

  const accessToken = useAccessToken();

  if (accessToken.value) {
    return navigateTo(publicConfig.redirect.home);
  }
});

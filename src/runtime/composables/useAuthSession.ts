import type { Ref } from "vue";
import type { User } from "../types";

import jwtDecode from "jwt-decode";
import {
  useRuntimeConfig,
  useState,
  useRequestEvent
} from "#app";
import { getCookie, setCookie } from "h3";
import { useLoggedIn } from "./useLoggedIn";
import { useAccessToken } from './useAccessToken'
import { useRefreshToken } from './useRefreshToken'
export default function () {
  const publicConfig = useRuntimeConfig().public.auth;
  const event = useRequestEvent();

  const useUser: () => Ref<User | null | undefined> = () => useState<User | null | undefined>("auth_user", () => null);

  function isAccessTokenExpired() {
    const accessToken = useAccessToken();
    if (accessToken.value) {
      const decoded = jwtDecode(accessToken.value) as { exp: number };
      const expires = decoded.exp * 1000;
      return expires < Date.now();
    }

    return true;
  }

  function isRefreshTokenExpired() {
    const refreshToken = useRefreshToken();

    if (refreshToken.value) {
      const decoded = jwtDecode(refreshToken.value) as { exp: number };
      const expires = decoded.exp * 1000;
      return expires < Date.now();
    }

    return true;
  }

  async function refresh(): Promise<void> {
    const accessToken = useAccessToken();
    const refreshToken = useRefreshToken();
    const isLoggedIn = useLoggedIn()
    const user = useUser();
    if (process.server) {
      accessToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-access-token`
      );
      refreshToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-refresh-token`
      );
    } else {
      if (isRefreshTokenExpired()) {
        accessToken.value = null
      }
    }

    if (accessToken.value) {
      if (isAccessTokenExpired() && !isRefreshTokenExpired()) {
        console.log('refresh!')
        await refreshAccessToken()
      }
      isLoggedIn.value = true
      if (!user.value) {
        const res = await $fetch<{ user: User }>("/auth/me", {
          baseURL: publicConfig.baseUrl,
          headers: {
            Authorization: "Bearer " + accessToken.value,
          },
        });
        user.value = res.user
      }
      return;
    }
  }

  async function refreshAccessToken(): Promise<void> {
    const refreshToken = useRefreshToken();
    const accessToken = useAccessToken();

    if (isRefreshTokenExpired()) {
      await revokeSession()
    }
    const tokens: { token: string, refresh_token: string } = await $fetch('/auth/refresh', {
      baseURL: publicConfig.baseUrl,
      method: 'POST',
      body: {
        refresh_token: refreshToken.value,
      },
    })

    if (process.server) {
      accessToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-access-token`
      );
      refreshToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-refresh-token`
      );
      setCookie(event, `${publicConfig.cookieOptions.name}-access-token`, tokens.token)
      setCookie(event, `${publicConfig.cookieOptions.name}-refresh-token`, tokens.refresh_token)
    }
    accessToken.value = tokens.token
    refreshToken.value = tokens.refresh_token
    console.log('tokens refreshed!');
  }

  async function revokeSession(): Promise<void> {
    const accessToken = useAccessToken();
    const refreshToken = useRefreshToken();
    const isLoggedIn = useLoggedIn()
    const user = useUser();
    accessToken.value = null
    isLoggedIn.value = false
    refreshToken.value = null
    user.value = null
  }

  return {
    useUser,
    refreshAccessToken,
    refresh,
    revokeSession
  };
}

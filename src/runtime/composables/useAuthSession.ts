import { AuthUser } from "#auth";
import type { Ref } from "vue";
import type { User } from "../types";
import jwtDecode from "jwt-decode";
import {
  useRuntimeConfig,
  useState,
  useRequestEvent
} from "#imports";

import { getCookie } from "h3";

import { useLoggedIn } from "./useLoggedIn";
import { useAccessToken } from './useAccessToken'
import { useRefreshToken } from './useRefreshToken'


export function useAuthSession() {
  const publicConfig = useRuntimeConfig().public.auth;
  const event = useRequestEvent();
  const accessToken = useAccessToken();
  const refreshToken = useRefreshToken();
  const isLoggedIn = useLoggedIn()

  const useUser: () => Ref<AuthUser | null | undefined> = () => useState<AuthUser | null | undefined>("auth_user", () => null);

  const user = useUser()

  function isAccessTokenExpired() {
    if (accessToken.value) {
      const decoded = jwtDecode(accessToken.value) as { exp: number };
      const expires = decoded.exp * 1000;
      return expires < Date.now();
    }
    return true;
  }

  function isRefreshTokenExpired() {
    if (refreshToken.value) {
      const decoded = jwtDecode(refreshToken.value) as { exp: number };
      const expires = decoded.exp * 1000;
      return expires < Date.now();
    }
    return true;
  }

  async function refresh(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    if (process.server && false) {
      accessToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-access-token`
      );
      refreshToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-refresh-token`
      );
      console.log('process.server', accessToken.value, refreshToken.value)
    }

    if (isRefreshTokenExpired()) {
      accessToken.value = ''
      refreshToken.value = ''
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

    // eslint-disable-next-line no-constant-condition
    if (process.server && false) {
      accessToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-access-token`
      );
      refreshToken.value = getCookie(
        event,
        `${publicConfig.cookieOptions.name}-refresh-token`
      );
    }

    if (refreshToken.value) {
      const tokens: { token: string, refresh_token: string } = await $fetch('/auth/refresh', {
        baseURL: publicConfig.baseUrl,
        method: 'POST',
        body: {
          refresh_token: refreshToken.value,
        },
      })

/*       if (process.server) {
        setCookie(event, `${publicConfig.cookieOptions.name}-access-token`, tokens.token)
        setCookie(event, `${publicConfig.cookieOptions.name}-refresh-token`, tokens.refresh_token)
      } else {
        accessToken.value = tokens.token
        refreshToken.value = tokens.refresh_token
      } */
      accessToken.value = tokens.token
      refreshToken.value = tokens.refresh_token
      console.log('tokens refreshed!');
    } else {
      console.log('tokens refresh not possible!');
    }
  }

  async function revokeSession(): Promise<void> {
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

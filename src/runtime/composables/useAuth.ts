import { useRuntimeConfig, useRoute, navigateTo } from "#imports";
import { useLoggedIn } from './useLoggedIn';
import type { User } from "../types";
import type { AsyncData } from "#app";
import { FetchError, FetchResponse } from "ofetch";
import type { H3Error } from "h3";
import { useAuthFetch } from "./useAuthFetch";
import { useAuthSession } from "./useAuthSession";
import { useAccessToken } from './useAccessToken'
import { useRefreshToken } from './useRefreshToken'
type FetchReturn<T> = Promise<AsyncData<T | null, FetchError<H3Error> | null>>;

export function useAuth() {
  const publicConfig = useRuntimeConfig().public.auth;
  const { useUser, revokeSession } = useAuthSession();

  const accessToken = useAccessToken();
  const refreshToken = useRefreshToken();
  const isLoggedIn = useLoggedIn()
  const user = useUser();

  async function login(credentials: {
    email: string;
    password: string;
  }) {
    const result: FetchResponse<{
      token: string
      refresh_token: string
    }> = await $fetch.raw("/auth/login", {
      method: "POST",
      baseURL: publicConfig.baseUrl,
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    }).catch((error) => error.data)

    if (result.ok && result._data) {

      isLoggedIn.value = true
      accessToken.value = result._data.token;
      refreshToken.value = result._data.refresh_token;

      if (accessToken.value) {
        const resultUser: { user: User } = await $fetch("/auth/me", {
          method: "GET",
          baseURL: publicConfig.baseUrl,
          headers: {
            Authorization: "Bearer " + accessToken.value,
          }
        })

        user.value = resultUser.user
      }

      if (accessToken.value) {
        await navigateTo(publicConfig.redirect.home);
      }

    }
    return result.ok;
  }

  async function fetchUser(): Promise<void> {
    const user = useUser();
    const res = await useAuthFetch<{ user: User }>("/auth/me");
    user.value = res.user
  }

  async function logout(): Promise<void> {
    const accessToken = useAccessToken()
    accessToken.value = null
    refreshToken.value = null
    await navigateTo(publicConfig.redirect.logout)
    revokeSession()
  }

  async function register(userInfo: {
    email: string;
    password: string;
    name: string;
  }): FetchReturn<void> {
    return $fetch("/api/auth/register", {
      method: "POST",
      body: userInfo,
      baseURL: publicConfig.baseUrl,
      credentials: "omit",
    });
  }

  async function requestPasswordReset(email: string): FetchReturn<void> {
    return $fetch("/api/auth/password/request", {
      method: "POST",
      baseURL: publicConfig.baseUrl,
      credentials: "omit",
      body: {
        email,
      },
    });
  }

  async function resetPassword(password: string): FetchReturn<void> {
    const route = useRoute();
    return $fetch("/api/auth/password/reset", {
      method: "PUT",
      credentials: "omit",
      baseURL: publicConfig.baseUrl,
      body: {
        password: password,
        token: route.query.token,
      },
    });
  }

  async function requestEmailVerify(email: string): FetchReturn<void> {
    return $fetch("/api/auth/email/request", {
      method: "POST",
      credentials: "omit",
      baseURL: publicConfig.baseUrl,
      body: {
        email,
      },
    });
  }

  async function changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return useAuthFetch("/api/auth/password/change", {
      method: "PUT",
      credentials: "omit",
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      },
    });
  }

  return {
    login,
    fetchUser,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    requestEmailVerify,
    changePassword,
  };
}

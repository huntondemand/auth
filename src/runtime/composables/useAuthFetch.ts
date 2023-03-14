import type { FetchOptions } from "ofetch";
import { useAuthSession } from "./useAuthSession";
import { defu } from "defu";
import { $fetch } from "ofetch";
import { useAccessToken } from './useAccessToken'
import { useRuntimeConfig } from '#imports'

export async function useAuthFetch<DataT>(
  path: string,
  fetchOptions: FetchOptions<"json"> = {}
): Promise<DataT> {

  const { baseUrl } = useRuntimeConfig().public.auth;
  fetchOptions.baseURL = baseUrl

  const { refresh } = useAuthSession();
  await refresh();

  console.log('auth_fetch');

  const accessToken = useAccessToken();
  fetchOptions.headers = defu(
    {
      Authorization: "Bearer " + accessToken.value,
    },
    fetchOptions.headers
  );

  return $fetch<DataT>(path, fetchOptions);
}

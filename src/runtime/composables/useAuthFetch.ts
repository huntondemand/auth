import type { FetchOptions } from "ofetch";
import useAuthSession from "./useAuthSession";
import { defu } from "defu";
import { $fetch } from "ofetch";
import { useAccessToken } from './useAccessToken'
export default async function <DataT>(
  path: string,
  fetchOptions: FetchOptions<"json"> = {}
): Promise<DataT> {
console.log('auth_fetch');

  const { refresh } = useAuthSession();
  const { baseUrl } = useRuntimeConfig().public.auth;
  const accessToken = useAccessToken();
  fetchOptions.baseURL = baseUrl
  await refresh();
  fetchOptions.headers = defu(
    {
      Authorization: "Bearer " + accessToken.value,
    },
    fetchOptions.headers
  );
  return $fetch<DataT>(path, fetchOptions);
}

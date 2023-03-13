import { useCookie, useRuntimeConfig } from '#imports'

export const useAccessToken = () => {
  const { cookieOptions } = useRuntimeConfig().public.auth
  const cookieName = `${cookieOptions.name}-access-token`

  return useCookie<string | null | undefined>(cookieName, { sameSite: true, maxAge: 60 * 60 * 12, default: () => '' })
}

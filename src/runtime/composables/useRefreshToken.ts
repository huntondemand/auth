import { useCookie, useRuntimeConfig } from '#imports'

export const useRefreshToken = () => {
  const { auth: { cookieOptions } } = useRuntimeConfig().public
  const cookieName = `${cookieOptions.name}_refresh_token`

  return useCookie<string | null | undefined>(cookieName, { sameSite: 'strict', maxAge: 12 * 3600 * 7, default: () => null })
}

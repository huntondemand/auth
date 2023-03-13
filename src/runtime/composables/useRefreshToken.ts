import { useCookie, useRuntimeConfig } from '#imports'

export const useRefreshToken = () => {
  const { auth: { cookieOptions } } = useRuntimeConfig().public
  const cookieName = `${cookieOptions.name}-refresh-token`

  return useCookie<string | null | undefined>(cookieName, { sameSite: 'strict', default: () => '' })
}

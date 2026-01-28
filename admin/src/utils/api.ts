import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = new Headers(options.headers)
      options.headers.set('Authorization', `Bearer ${accessToken}`)
    }
  },
  async onResponseError({ response }) {
    if (response.status === 401 && !response.url.includes('/auth/admin/login')) {
      const accessToken = useCookie('accessToken')
      const userData = useCookie('userData')
      
      accessToken.value = null
      userData.value = null
      
      window.location.href = '/login'
    }
  },
})

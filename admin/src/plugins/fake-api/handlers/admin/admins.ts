import type { PathParams } from 'msw'
import { HttpResponse, http } from 'msw'

// Mock admin data
const admins = [
  {
    id: 1,
    username: 'admin',
    avatar: 'https://via.placeholder.com/150',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'superadmin',
    avatar: 'https://via.placeholder.com/150',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
]

export const handlerAdminAdmins = [
  // Get all admins
  http.get('/admin/admins', () => {
    return HttpResponse.json(admins, { status: 200 })
  }),

  // Create new admin
  http.post<PathParams>('/admin/admins', async ({ request }) => {
    const { username, password, avatar } = await request.json() as any
    
    const newAdmin = {
      id: admins.length + 1,
      username,
      avatar: avatar || 'https://via.placeholder.com/150',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    
    admins.push(newAdmin)
    
    return HttpResponse.json(newAdmin, { status: 201 })
  }),
]
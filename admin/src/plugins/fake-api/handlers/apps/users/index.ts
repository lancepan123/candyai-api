import is from '@sindresorhus/is'
import { destr } from 'destr'
import type { PathParams } from 'msw'
import { HttpResponse, http } from 'msw'
import { db } from '@db/apps/users/db'
import { paginateArray } from '@api-utils/paginateArray'

export const handlerAppsUsers = [
  // Get Users Details
  http.get(('/api/apps/users'), ({ request }) => {
    const url = new URL(request.url)

    const q = url.searchParams.get('q')
    const role = url.searchParams.get('role')
    const plan = url.searchParams.get('plan')
    const status = url.searchParams.get('status')
    const sortBy = url.searchParams.get('sortBy')
    const itemsPerPage = url.searchParams.get('itemsPerPage')
    const page = url.searchParams.get('page')
    const orderBy = url.searchParams.get('orderBy')

    const searchQuery = is.string(q) ? q : undefined
    const queryLower = (searchQuery ?? '').toString().toLowerCase()

    const parsedSortBy = destr(sortBy)
    const sortByLocal = is.string(parsedSortBy) ? parsedSortBy : ''

    const parsedOrderBy = destr(orderBy)
    const orderByLocal = is.string(parsedOrderBy) ? parsedOrderBy : ''

    const parsedItemsPerPage = destr(itemsPerPage)
    const parsedPage = destr(page)

    const itemsPerPageLocal = is.number(parsedItemsPerPage) ? parsedItemsPerPage : 10
    const pageLocal = is.number(parsedPage) ? parsedPage : 1

    // filter users
    let filteredUsers = db.users.filter(user => ((user.fullName.toLowerCase().includes(queryLower) || user.email.toLowerCase().includes(queryLower)) && user.role === (role || user.role) && user.currentPlan === (plan || user.currentPlan) && user.status === (status || user.status))).reverse()

    // sort users
    if (sortByLocal) {
      console.log(sortByLocal)
      if (sortByLocal === 'user') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.fullName.localeCompare(b.fullName)
          else
            return b.fullName.localeCompare(a.fullName)
        })
      }
      if (sortByLocal === 'email') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.email.localeCompare(b.email)
          else
            return b.email.localeCompare(a.email)
        })
      }
      if (sortByLocal === 'role') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.role.localeCompare(b.role)
          else
            return b.role.localeCompare(a.role)
        })
      }
      if (sortByLocal === 'plan') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.currentPlan.localeCompare(b.currentPlan)
          else
            return b.currentPlan.localeCompare(a.currentPlan)
        })
      }
      if (sortByLocal === 'status') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.status.localeCompare(b.status)
          else
            return b.status.localeCompare(a.status)
        })
      }
      if (sortByLocal === 'billing') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.billing.localeCompare(b.billing)
          else
            return b.billing.localeCompare(a.billing)
        })
      }
    }

    const totalUsers = filteredUsers.length

    // total pages
    const totalPages = Math.ceil(totalUsers / itemsPerPageLocal)

    return HttpResponse.json(
      {
        users: paginateArray(filteredUsers, itemsPerPageLocal, pageLocal),
        totalPages,
        totalUsers,
        page: pageLocal > Math.ceil(totalUsers / itemsPerPageLocal) ? 1 : page,
      },
      { status: 200 },
    )
  }),

  // Get Single User Detail
  http.get<PathParams>(('/api/apps/users/:id'), ({ params }) => {
    const userId = Number(params.id)

    const user = db.users.find(e => e.id === userId)

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    else {
      return HttpResponse.json(
        {
          ...user,
          ...{
            taskDone: 1230,
            projectDone: 568,
            taxId: 'Tax-8894',
            language: 'English',
          },
        },
        { status: 200 },
      )
    }
  }),

  // Delete User
  http.delete(('/api/apps/users/:id'), ({ params }) => {
    const userId = Number(params.id)

    const userIndex = db.users.findIndex(e => e.id === userId)

    if (userIndex === -1) {
      return HttpResponse.json('User not found', { status: 404 })
    }
    else {
      db.users.splice(userIndex, 1)

      return new HttpResponse(null, {
        status: 204,
      })
    }
  }),

  // 👉 Add user
  http.post(('/api/apps/users'), async ({ request }) => {
    const user = await request.json() as any

    db.users.push({
      ...user,
      id: db.users.length + 1,
    })

    return HttpResponse.json(
      { body: user },
      { status: 201 },
    )
  }),

  // 👉 Admin users endpoints
  http.get(('/admin/users'), ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const role = url.searchParams.get('role')
    const limit = url.searchParams.get('limit')
    const page = url.searchParams.get('page')

    // Simple filtering and pagination
    let filteredUsers = db.users

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    const limitNum = limit ? parseInt(limit) : 10
    const pageNum = page ? parseInt(page) : 1
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return HttpResponse.json({
      users: paginatedUsers,
      totalUsers: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limitNum),
      currentPage: pageNum,
    }, { status: 200 })
  }),

  http.get(('/admin/roles'), () => {
    const roles = [...new Set(db.users.map(user => user.role))]
    return HttpResponse.json(roles, { status: 200 })
  }),

  http.patch<PathParams>(('/admin/users/:id/ban'), ({ params, request }) => {
    const userId = Number(params.id)
    const { isBanned } = request.json() as any
    
    const userIndex = db.users.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    db.users[userIndex].status = isBanned ? 'banned' : 'active'
    
    return HttpResponse.json(db.users[userIndex], { status: 200 })
  }),
]

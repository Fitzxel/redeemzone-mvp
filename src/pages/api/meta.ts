import type { APIRoute } from 'astro'
import { createClerkClient } from '@clerk/astro/server'

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
}

const clerkClient = createClerkClient({
  secretKey: import.meta.env.CLERK_SECRET_KEY,
})

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = await locals.currentUser().then((user) => user?.id)
    if (!userId) throw ERROR.UNAUTHORIZED

    const data = await request.json()

    // set private metadata for the user
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...data,
      },
    })

    return new Response('Success', { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const userId = await locals.currentUser().then((user) => user?.id)
    if (!userId) throw ERROR.UNAUTHORIZED

    // get the user's private metadata
    const user = await clerkClient.users.getUser(userId)
    const privateMetadata = user.privateMetadata

    return new Response(JSON.stringify(privateMetadata), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}
import type { APIRoute } from 'astro'
import { createClerkClient } from '@clerk/astro/server'

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
  USERNAME_REQUIRED: Symbol('USERNAME_REQUIRED'),
  COINS_REQUIRED: Symbol('COINS_REQUIRED'),
  USER_NOT_FOUND: Symbol('USER_NOT_FOUND'),
}

const clerkClient = createClerkClient({
  secretKey: import.meta.env.CLERK_SECRET_KEY,
})

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser() as User | null
    if (!user) throw ERROR.UNAUTHORIZED

    const { username, coins, storeId } = await request.json() as { username: string, coins: number, storeId: string }
    if (!username) throw ERROR.USERNAME_REQUIRED
    if (!coins || coins < 0) throw ERROR.COINS_REQUIRED

    // search for user with externalId
    const userToGiveCoins = await clerkClient.users.getUserList({
      username: [username]
    }).then(res => res.data[0])
    if (!userToGiveCoins) throw ERROR.USER_NOT_FOUND

    const wallet = userToGiveCoins.publicMetadata?.wallet as UserPublicData['wallet'] || {}
    wallet[storeId] = wallet[storeId] || 0
    wallet[storeId] += coins

    // give coins to the user
    await clerkClient.users.updateUserMetadata(userToGiveCoins.id, {
      publicMetadata: {
        wallet: wallet
      },
    })

    return new Response('Success', { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.USERNAME_REQUIRED) {
      return new Response('Username required', { status: 400 })
    }
    if (err === ERROR.COINS_REQUIRED) {
      return new Response('Coins required', { status: 400 })
    }
    if (err === ERROR.USER_NOT_FOUND) {
      return new Response('User not found', { status: 404 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}
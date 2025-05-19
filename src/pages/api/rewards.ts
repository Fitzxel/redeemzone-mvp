import type { APIRoute } from 'astro'
import { createClerkClient } from '@clerk/astro/server'

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
  NO_REWARDS: Symbol('NO_REWARDS'),
  TWITCH_TOKEN_REQUIRED: Symbol('TWITCH_TOKEN_REQUIRED'),
}

const clerkClient = createClerkClient({
  secretKey: import.meta.env.CLERK_SECRET_KEY,
})

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser() as User | null
    if (!user) throw ERROR.UNAUTHORIZED

    const { rewards, twToken } = await request.json() as { twToken: string, rewards: DefaultReward[] }
    if (!twToken) throw ERROR.TWITCH_TOKEN_REQUIRED
    if (!rewards.length) throw ERROR.NO_REWARDS

    // create rewards with twitch api, and use the response to set the rewards in the user public metadata
    const rewardsFromTwitch = [] as Reward[]

    for (const reward of rewards) {
      // @ts-ignore
      const res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${user.externalAccounts[0].externalId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${twToken}`,
          'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: reward.title,
          cost: reward.cost,
          background_color: reward.background_color,
        }),
      })
      const settedReward = await res.json()
      if (!res.ok) throw new Error(settedReward.message || settedReward.error || settedReward.code)

      rewardsFromTwitch.push(settedReward.data[0])
    }

    const settedRewards = user.publicMetadata?.settedRewards || []
    settedRewards.push(...rewardsFromTwitch.map((reward) => ({
      id: reward.id,
      cost: reward.cost,
    })))

    // set public metadata for the user
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        settedRewards: settedRewards
      },
    })

    return new Response('Success', { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.TWITCH_TOKEN_REQUIRED) {
      return new Response('Twitch token required', { status: 400 })
    }
    if (err === ERROR.NO_REWARDS) {
      return new Response('No rewards', { status: 400 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser() as User | null
    if (!user) throw ERROR.UNAUTHORIZED

    const { rewards, twToken } = await request.json() as { twToken: string, rewards: SettedReward[] }
    if (!twToken) throw ERROR.TWITCH_TOKEN_REQUIRED
    if (!rewards.length) throw ERROR.NO_REWARDS

    for (const reward of rewards) {
      // @ts-ignore
      const res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${user.externalAccounts[0].externalId}&id=${reward.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${twToken}`,
          'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
        }
      })
      if (!res.ok && res.status !== 404) throw new Error(res.statusText)
    }
    
    const settedRewards = user.publicMetadata?.settedRewards || []
    const newSettedRewards = settedRewards.filter((settedReward) => !rewards.some((reward) => reward.id === settedReward.id))

    // set public metadata for the user
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        settedRewards: newSettedRewards
      },
    })

    return new Response('Success', { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.TWITCH_TOKEN_REQUIRED) {
      return new Response('Twitch token required', { status: 400 })
    }
    if (err === ERROR.NO_REWARDS) {
      return new Response('No rewards', { status: 400 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}
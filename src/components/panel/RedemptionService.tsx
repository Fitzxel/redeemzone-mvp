import { useEffect, useRef, useState } from 'react'
import { COIN_VALUE_PER_TWITCH_POINT } from '@/data/coin.data'
import { Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Props {
  user: User
}

export default ({ user }: Props) => {
  const socketRef = useRef<WebSocket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null as string | null)
  const [connected, setConnected] = useState(false)

  const [redemptionsEvents, setRedemptionsEvents] = useState([] as RedemptionEvent[])

  const giveCoins = async (twToken: string, event: RedemptionEvent) => {
    // give coins to user
    const res = await fetch('/api/coins', {
      method: 'POST',
      body: JSON.stringify({
        username: event.user_login,
        coins: event.reward.cost*COIN_VALUE_PER_TWITCH_POINT,
        storeId: user.publicMetadata?.yourStoreId,
      }),
    })
    if (!res.ok && res.status !== 404) throw new Error(res.statusText)
    if (res.status === 404) return // user not found, probably not registered

    // update redemtion status
    // @ts-ignore
    const update = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${user.externalAccounts[0].externalId}&reward_id=${event.reward.id}&id=${event.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${twToken}`,
        'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'FULFILLED',
      }),
    })
    if (!update.ok && update.status !== 404) throw new Error(update.statusText)
  }

  const init = async () => {
    console.log('init')
    setLoading(true)

    try {
      // get twToken from localStorage
      const twToken = localStorage.getItem('twToken')
      if (!twToken) throw new Error('no twToken')

      // connect to socket
      socketRef.current = new WebSocket('wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30')
      let sessionId: string
      let lastKeppAlive: number
      let interval: NodeJS.Timeout

      socketRef.current.addEventListener('open', () => {
        console.log('Socket open')
      })

      socketRef.current.addEventListener('message', async (event) => {
        const { metadata, payload } = JSON.parse(event.data)
        console.log({ metadata, payload })
        if (metadata.message_type === 'session_keepalive') {
          lastKeppAlive = Date.now()
        }
        if (metadata.message_type === 'session_welcome') {
          interval = setInterval(() => {
            if (!lastKeppAlive) return
    
            const now = Date.now()
            if (now - lastKeppAlive > 30000) {
              clearInterval(interval)
              socketRef.current?.close()
              setConnected(false)
              console.log('Socket connection lost')
              // reconnect
              console.log('reconnecting')
              init()
            }
          }, 30000)

          sessionId = payload.session.id

          // subscribe to channel new redemption event
          const subEvent = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${twToken}`,
              'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'channel.channel_points_custom_reward_redemption.add',
              version: '1',
              condition: {
                // @ts-ignore
                broadcaster_user_id: user.externalAccounts[0].externalId,
              },
              transport: {
                method: 'websocket',
                session_id: sessionId,
              },
            }),
          })
          const subEventData = await subEvent.json()
          if (!subEvent.ok) throw new Error(subEventData.message || subEventData.error || subEventData.code)

          setConnected(true)

          // get all event subscriptions
          const subEventSubscriptions = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions?type=channel.channel_points_custom_reward_redemption.add', {
            headers: {
              Authorization: `Bearer ${twToken}`,
              'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
            },
          })
          const subEventSubscriptionsData = await subEventSubscriptions.json()
          if (!subEventSubscriptions.ok) throw new Error(subEventSubscriptionsData.message || subEventSubscriptionsData.error || subEventSubscriptionsData.code)

          if (subEventSubscriptionsData.data.filter((subEventSubscription: any) => subEventSubscription.status === 'enabled').length > 1) {
            // another service is listening, stop this service
            console.log('another service is listening, stop this service')
            socketRef.current?.close()
            setConnected(false)
            throw new Error('multiple services listening is not allowed')
          }

          const subEventSubscriptionsEvents = subEventSubscriptionsData.data.filter((subEventSubscription: any) => subEventSubscription.status !== 'enabled')

          // delte all events that dont enabled
          for (const subEventSubscription of subEventSubscriptionsEvents) {
            fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subEventSubscription.id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${twToken}`,
                'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
              },
            })
          }
        }
        if (metadata.message_type === 'notification') {
          const { subscription, event } = payload
          const isSettedReward = user.publicMetadata?.settedRewards?.some((settedReward: SettedReward) => settedReward.id === event.reward.id)
          if (!isSettedReward) return
          console.log(event)

          await giveCoins(twToken, event)
          setRedemptionsEvents(events => [...events, event])
        }
      })

      // get past redemptions
      const settedRewards = user.publicMetadata?.settedRewards || []
      for (const reward of settedRewards) {
        // @ts-ignore
        const pastRedemptions = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${user.externalAccounts[0].externalId}&reward_id=${reward.id}&status=UNFULFILLED&first=50`, {
          headers: {
            Authorization: `Bearer ${twToken}`,
            'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
          },
        })
        const pastRedemptionsData = await pastRedemptions.json()
        if (!pastRedemptions.ok && pastRedemptions.status !== 404) throw new Error(pastRedemptionsData.message || pastRedemptionsData.error || pastRedemptionsData.code)

        await Promise.all(pastRedemptionsData.data.map(async (pastRedemption: RedemptionEvent) => {
          await giveCoins(twToken, pastRedemption)
          setRedemptionsEvents(events => [...events, pastRedemption])
        }))
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    init()

    return () => {
      socketRef.current?.close()
    }
  }, [])

  return (
    <main className='h-full p-4 flex flex-col gap-4'>
      <h1 className='text-lg font-bold'>
        Servicio de puntos x monedas
      </h1>
      <div>
        Estado:
        &nbsp;
        {
          connected ?
          <span className='text-green-500'>
            Conectado
          </span> :
          <span className='text-red-500'>
            Desconectado
          </span>
        }
      </div>
      <Separator />
      {
        loading && !error &&
        <div className='h-full flex justify-center items-center'>
          <Loader2 className='animate-spin w-16 h-16' />
        </div>
      }
      {
        error &&
        <div className='text-red-500'>
          Error al iniciar el servicio: {error}
        </div>
      }
      {
        !loading && !error && redemptionsEvents.length === 0 &&
        <p className='text-center text-muted-foreground'>
          No se han reclamado monedas aún
        </p>
      }
      {
        !loading && !error &&
        <div className='flex flex-col gap-4 overflow-auto [&>:nth-child(2n)]:bg-muted/30'>
          {
            redemptionsEvents.map((redemptionEvent) => (
              <div key={redemptionEvent.id}>
                <p className='text-sm text-muted-foreground'>
                  {new Date(redemptionEvent.redeemed_at).toLocaleString()}
                </p>
                <p className='text-mango-400'>
                  ¡{redemptionEvent.user_name} a reclamado {(redemptionEvent.reward.cost*COIN_VALUE_PER_TWITCH_POINT).toLocaleString()} monedas!
                </p>
              </div>
            ))
          }
        </div>
      }
    </main>
  )
}
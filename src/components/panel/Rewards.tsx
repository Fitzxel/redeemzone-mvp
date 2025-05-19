import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COIN_VALUE_PER_TWITCH_POINT } from '@/data/coin.data'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'
import RewardsConfigurator from './RewardsConfigurator'
import RewardOptions from './RewardOptions'

interface Props {
  user: User
  twToken: string
}

export default ({ user, twToken }: Props) => {
  const [loading, setLoading] = useState(true)
  const [rewards, setRewards] = useState([] as Reward[]) // rewards that match with the user setted rewards
  const [error, setError] = useState(null as string | null)

  const userStore = useStore($userStore) as User

  const getTwRewards = async () => {
    user = await userStore.reload() as User

    setError(null)
    setLoading(true)
    try {
      const settedRewards = user.publicMetadata?.settedRewards || []
      if (!settedRewards.length) throw new Error('no setted rewards')

      // @ts-ignore
      const res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${user?.externalAccounts[0].externalId || user?.externalAccounts[0].providerUserId}`, {
        headers: {
          Authorization: `Bearer ${twToken}`,
          'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || data.code)

      const rewards = data.data.filter((reward: Reward) => settedRewards.some((settedReward: SettedReward) => settedReward.id === reward.id)).sort((a: Reward, b: Reward) => a.cost - b.cost)
      setRewards(rewards)
    } catch (err: any) {
      if (err.message === 'no setted rewards') {
        setRewards([])
      }
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTwRewards()
  }, [])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between'>
        <h2 className='text-lg font-bold'>
          Recompensas configuradas
        </h2>
        <RewardsConfigurator onAdd={() => getTwRewards()} user={user} rewards={rewards} twToken={twToken} />
      </div>
      {
        error && !loading &&
        <div className='text-red-500'>
          Error al obtener recompensas: {error}
        </div>
      }
      {
        !error && loading &&
        <div className='text-muted-foreground'>
          Cargando...
        </div>
      }
      {
        !error && !loading && rewards.length === 0 &&
        <p className='text-center text-muted-foreground'>
          No hay recompensas configuradas
        </p>
      }
      {
        !error && !loading && rewards.length > 0 &&
        <div className='flex flex-col gap-2'>
          {
            rewards.map((reward) => (
              <Card key={reward.id} className='w-full py-3'>
                <CardContent className='px-3 flex justify-between items-center gap-3'>
                  <div className='flex gap-3'>
                    <img
                      src={reward.default_image?.url_1x}
                      alt={reward.title}
                      className='w-12 h-12 rounded-full border-2 border-border overflow-hidden'
                    />
                    <div>
                      <CardTitle className='text-base'>
                        {reward.title}
                      </CardTitle>
                      <CardDescription className='text-sm'>
                        {reward.prompt}
                      </CardDescription>
                      <span className='text-sm text-purple-600'>
                        Costo: {reward.cost.toLocaleString()} puntos
                      </span>
                      <br />
                      <span className='text-sm text-mango-400'>
                        Equivalente: {(reward.cost * COIN_VALUE_PER_TWITCH_POINT).toLocaleString()} monedas
                      </span>
                    </div>
                  </div>
                  <RewardOptions
                    onDelete={() => getTwRewards()}
                    reward={reward}
                    twToken={twToken}
                  />
                </CardContent>
              </Card>
            ))
          }
        </div>
      }
    </div>
  )
}
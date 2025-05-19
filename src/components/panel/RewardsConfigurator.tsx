import { useState, useEffect, useRef } from 'react'
import { DEFAULT_REWARDS } from '@/data/rewards.data'
import { COIN_VALUE_PER_TWITCH_POINT } from '@/data/coin.data'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
  onAdd: () => void
  user: User
  rewards: Reward[]
  twToken: string
}

export default ({ onAdd, user, rewards, twToken }: Props) => {
  const [rewardsToAdd, setRewardsToAdd] = useState([] as DefaultReward[])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null as string | null)

  const setRewards = async (rewardsToAdd: DefaultReward[]) => {
    setIsSubmitting(true)
    
    // call api to set rewards
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        body: JSON.stringify({
          twToken,
          rewards: rewardsToAdd
        }),
      })
      if (!res.ok) throw new Error(res.statusText)

      onAdd()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
      setDone(true)
    }
  }

  const onOpen = () => {
    setRewardsToAdd([])
    setIsSubmitting(false)
    setDone(false)
    setError(null)
  }

  const firstLoad = useRef(true)

  useEffect(() => {
    if (user && rewards.length && user.publicMetadata?.settedRewards && user.publicMetadata?.settedRewards.length) {
      if (!firstLoad.current) return
      firstLoad.current = false

      // filter rewards that dont match with the user setted rewards
      const notMatchedRewards = user.publicMetadata?.settedRewards.filter((settedReward: SettedReward) => !rewards.some((reward: Reward) => reward.id === settedReward.id))
      if (!notMatchedRewards.length) return
      
      // clear not matched rewards on the user setted rewards
      fetch('/api/rewards', {
        method: 'DELETE',
        body: JSON.stringify({
          twToken,
          rewards: notMatchedRewards
        }),
      })
    }
  }, [rewards])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={onOpen}
        >
          Configurar
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            Configurar recompensas
          </DialogTitle>
          <DialogDescription>
            Selecciona las recompensas que quieres configurar para que tus espectadores puedan obtener monedas.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          {
            !done && DEFAULT_REWARDS.filter((reward) => !rewards.some(gettedReward => gettedReward.cost === reward.cost)).map((reward, i) => (
              <Card key={i} className='w-full py-3'>
                <CardContent className='px-3 flex justify-between items-center gap-3'>
                  <div>
                    <CardTitle className='text-base'>
                      {reward.title}
                    </CardTitle>
                    <span className='text-sm text-purple-600'>
                      Costo: {reward.cost.toLocaleString()} puntos
                    </span>
                    <br />
                    <span className='text-sm text-mango-400'>
                      Equivalente: {(reward.cost * COIN_VALUE_PER_TWITCH_POINT).toLocaleString()} monedas
                    </span>
                  </div>
                  <Button
                    disabled={isSubmitting || done}
                    className={cn(
                      rewardsToAdd.some(addedReward => addedReward.cost === reward.cost) && 'bg-purple-600 hover:bg-purple-700 text-white'
                    )}
                    onClick={() => {
                      if (rewardsToAdd.some(addedReward => addedReward.cost === reward.cost))
                        setRewardsToAdd(rewardsToAdd.filter(addedReward => addedReward.cost !== reward.cost))
                      else
                        setRewardsToAdd(rewardsToAdd => [...rewardsToAdd, reward])
                    }}
                  >
                    {
                      rewardsToAdd.some(addedReward => addedReward.cost === reward.cost) ?
                      <>
                        <Check />
                      </> :
                      <>
                        <Plus />
                        Añadir
                      </>
                    }
                  </Button>
                </CardContent>
              </Card>
            ))
          }
          {
            done && error && !isSubmitting &&
            <div className='text-red-500'>
              Error al añadir recompensas: {error}
            </div>
          }
          {
            done && !error && !isSubmitting &&
            <div className='text-green-500'>
              Recompensas añadidas correctamente
            </div>
          }
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant='secondary'
              disabled={isSubmitting}
            >
              {
                !done ? 'Cancelar' : 'Cerrar'
              }
            </Button>
          </DialogClose>
          {
            !done && !error &&
            <Button
              disabled={rewardsToAdd.length === 0 || isSubmitting}
              onClick={() => setRewards(rewardsToAdd)}
            >
              {
                isSubmitting && <Loader2 className='animate-spin-clockwise animate-iteration-count-infinite' />
              }
              Listo
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
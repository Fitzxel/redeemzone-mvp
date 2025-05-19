import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COIN_VALUE_PER_TWITCH_POINT } from '@/data/coin.data'
import { Button } from '@/components/ui/button'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Twitch } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Rewards from '@/components/panel/Rewards.tsx'

export default ({ user }: { user: User }) => {
  const [checking, setChecking] = useState(true)
  const [twToken, setTwToken] = useState(null as string | null)
  const [isValid, setIsValid] = useState(false)
  const [servicePage, setServicePage] = useState(null as Window | null)
  
  const openListenerService = () => {
    const servicePage = window.open('/service', '_blank', 'width=390,height=600')
    setServicePage(servicePage)
  }

  const getTwTokenFromLocalStorage = () => {
    const twToken = localStorage.getItem('twToken')
    setTwToken(twToken)
    return twToken
  }

  const checkIfTwTokenIsValid = async (twToken: string) => {
    try {
      // @ts-ignore
      await fetch(`https://api.twitch.tv/helix/users?id=${user?.externalAccounts[0].externalId}`, {
        headers: {
          Authorization: `Bearer ${twToken}`,
          'Client-Id': import.meta.env.PUBLIC_TWITCH_CLIENT_ID,
        },
      }).then(res => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })

      setIsValid(true)
    } catch (err) {
      setIsValid(false)
    } finally {
      setChecking(false)
    }
  }

  const requestNewTwToken = async () => {
    setChecking(true)
    localStorage.removeItem('twToken')

    window.open(`https://id.twitch.tv/oauth2/authorize?client_id=${import.meta.env.PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}/twitch/callback&response_type=token&scope=channel:manage:redemptions&force_verify=true`, '_blank')

    const interval = setInterval(async () => {
      const twToken = getTwTokenFromLocalStorage()
      if (twToken) clearInterval(interval)
    }, 100)
  }

  useEffect(() => {
    const twToken = getTwTokenFromLocalStorage()
    if (!twToken) setChecking(false)
  }, [])

  useEffect(() => {
    if (twToken) checkIfTwTokenIsValid(twToken)
  }, [twToken])

  const value_text = `${COIN_VALUE_PER_TWITCH_POINT} puntos`
  
  return (
    <Card className='w-full max-h-[calc(100vh-56px-48px)] pb-0 gap-3'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>
          Servicio de puntos x monedas
        </CardTitle>
        <CardDescription>
          Ejecutar servicio para que los espectadores canjeen sus puntos por monedas.
        </CardDescription>
        {
          isValid && twToken &&
          <div className='flex justify-between'>
            <div className='flex gap-1'>
              <Label>
                Valor de la moneda:
              </Label>
              <div
                className='relative'
                title={`Valor de la moneda: ${value_text}`}
              >
                <Lock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  disabled
                  value={`${value_text}`}
                  className='pl-10'
                  style={{
                    width: `calc(0.75rem + 2.5rem + ${value_text.length}ch)`,
                  }}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                if (servicePage && !servicePage.closed) servicePage.focus()
                else openListenerService()
              }}
            >
              <SquareArrowOutUpRight />
              Iniciar servicio
            </Button>
          </div>
        }
        <Separator />
      </CardHeader>
      <CardContent className='space-y-4 pb-6 overflow-auto'>
        {
          checking ?
          <p className='text-center text-muted-foreground'>
            Verificando...
          </p> :
          isValid && twToken ?
          <Rewards user={user} twToken={twToken} /> :
          <div className='flex justify-center'>
            <Button
              onClick={() => requestNewTwToken()}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              <Twitch />
              Solicitar permisos
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  )
}
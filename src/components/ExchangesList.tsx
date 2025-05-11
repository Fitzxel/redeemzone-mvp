import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'
import ExchangeCard from '@/components/ExchangeCard.tsx'
import { Skeleton } from '@/components/ui/skeleton'

export default () => {
  const [loading, setLoading] = useState(true)
  const [exchanges, setExchanges] = useState([] as Exchange[])
  const user = useStore($userStore)

  useEffect(() => {
    if (user) {
      (async () => {
        const res = await fetch('/api/exchanges')
        const data = await res.json()
        setLoading(false)
        setExchanges(data)
      })()
    }
  }, [user])

  return (
    <Card className='w-full max-w-3xl mx-auto shadow-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>
          Canjes
        </CardTitle>
        <CardDescription>
          Aquí podrás ver y gestionar tus canjes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Separator />
          {
            loading && (
              <>
                <Skeleton className='w-full h-24 rounded-md' />
                <Skeleton className='w-full h-24 rounded-md' />
                <Skeleton className='w-full h-24 rounded-md' />
              </>
            )
          }
          {
            exchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}
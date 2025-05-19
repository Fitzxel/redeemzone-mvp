import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ExchangeCard from '@/components/ExchangeCard.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'

export default ({ storeId }: { storeId: string }) => {
  const [loading, setLoading] = useState(true)
  const [exchanges, setExchanges] = useState([] as Exchange[])

  const fetchExchanges = async () => {
    if (!storeId) return

    setLoading(true)
    const res = await fetch(`/api/exchanges?storeId=${storeId}`)
    const data = await res.json()
    setLoading(false)
    setExchanges(data)
  }

  useEffect(() => {
    fetchExchanges()

    const interval = setInterval(() => {
      fetchExchanges()
    }, 1000 * 60 * 5)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className='w-full'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold flex justify-between'>
          Canjes
          <Button
            disabled={loading}
            onClick={() => fetchExchanges()}
          >
            <RotateCw />
            Recargar
          </Button>
        </CardTitle>
        <CardDescription>
          Administra los canjes que has recibido.
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
            !loading && exchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          }
          {
            !loading && exchanges.length === 0 &&
            <div className='text-center text-muted-foreground'>
              No tienes canjes
            </div>
          }
        </div>
      </CardContent>
    </Card>
  )
}
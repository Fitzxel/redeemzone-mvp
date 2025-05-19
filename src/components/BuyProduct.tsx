import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import CoinImage from './CoinImage'
import Infinite from './icons/Infinite'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'

interface Props extends React.ComponentProps<"button"> {
  store: Store
  product: Product
  onBuy?: () => void
}

export default ({ store, product, onBuy, ...props }: Props) => {
  const user = useStore($userStore) as User | null
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null as string | null)
  const coins = useMemo(() => user?.publicMetadata?.yourStoreId === store.id ? Infinity : user?.publicMetadata?.wallet[store.id] || 0, [user])
  const canBuy = useMemo(() => coins >= product.price, [coins])

  const buyProduct = async () => {
    if (!user) return
    if (!canBuy) return
    if (product.stock <= 0) return
    setIsSubmitting(true)

    try {
      await fetch(`/api/exchanges`, {
        method: 'POST',
        body: JSON.stringify({
          product,
        }),
      })

      setIsOpen(false)
      // reload user
      user.reload()
      
      if (onBuy) onBuy()
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onOpen = () => {
    setIsSubmitting(false)
    setError(null)
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          className='w-full text-base font-bold bg-green-600 hover:bg-green-700'
          onClick={onOpen}
          {...props}
        >
          Comprar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Comprar producto
          </AlertDialogTitle>
          <AlertDialogDescription>
            {product.name}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {
          !user &&
          <div className='text-red-500'>
            Inicia sesión para comprar
          </div>
        }
        {
          error &&
          <div className='text-red-500'>
            Error al realizar la compra: {error}
          </div>
        }
        {
          user && !error &&
          <div className='flex flex-col gap-2'>
            <p>
              Costo:&nbsp;
              <span className='text-mango-400'>
                <CoinImage coin={store.coin} className='inline-block w-4 h-4 mr-1' />
                {product.price.toLocaleString()}
              </span>
              &nbsp;{store.coin.name}
            </p>
            <Separator />
            <p>
              Tienes:&nbsp;
              <span className={cn(
                'text-mango-400',
                !canBuy && 'text-red-500'
              )}>
                <CoinImage coin={store.coin} className='inline-block w-4 h-4 mr-1' />
                {
                  coins === Infinity
                  ? <Infinite className='inline-block w-5 h-5' />
                  : coins.toLocaleString()
                }
              </span>
              &nbsp;{store.coin.name}
            </p>
            {
              !canBuy &&
              <p className='text-red-500'>
                No tienes monedas suficientes
              </p>
            }
          </div>
        }
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
          >
            {user ? 'Cancelar' : 'Cerrar'}
          </AlertDialogCancel> 
          {
            user && !error &&
            <Button
              disabled={!canBuy || isSubmitting}
              onClick={buyProduct}
            >
              {isSubmitting && <Loader2 className='animate-spin' />}
              Comprar
            </Button>
          }
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
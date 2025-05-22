import { Card, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card'
import Coins from '../icons/Coins'
import { Package, Shirt, BookMarked, Smartphone, Gamepad2, TvMinimal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const Products = [
  {
    name: 'Shirt',
    description: 'A amazing shirt',
    price: 100,
    stock: 300,
    Icon: Shirt,
  },
  {
    name: 'Especial Box',
    description: 'Special box for an special viewer',
    price: 600,
    stock: 10,
    Icon: Package,
  },
  {
    name: 'My book',
    description: 'The best book ever',
    price: 30,
    stock: 50,
    Icon: BookMarked,
  },
  {
    name: 'sPhone X',
    description: 'The new sPhone X',
    price: 1000,
    stock: 100,
    Icon: Smartphone,
  },
  {
    name: 'Costumized gamepad',
    description: 'I gonna costumize a gamepad for you',
    price: 500,
    stock: 30,
    Icon: Gamepad2,
  },
  {
    name: 'Droid TV',
    description: 'Droid TV or the value of this',
    price: 20000,
    stock: 5,
    Icon: TvMinimal,
  },
]

export default ({ className }: { className?: string }) => {
  const product = Products[Math.floor(Math.random() * Products.length)]
  const animations = ['animate-jiggle animate-duration-[30s]', 'animate-float animate-duration-[10s]']

  return (
      <Card className={cn(
        'w-64 min-h-72 py-3 gap-1 opacity-45 saturate-50 animate-iteration-count-infinite',
        animations[Math.floor(Math.random() * animations.length)],
        className
      )}>
        <CardContent className='mb-2 flex-1 flex flex-col items-center gap-3'>
          <product.Icon className='w-20 h-20 text-mango-400' />
          <div className='text-center'>
            <CardTitle className='text-1xl font-bold'>
              {product.name}
            </CardTitle>
            <CardDescription className='text-sm'>
              {product.description}
            </CardDescription>
          </div>
          <div className='flex justify-center items-center gap-2'>
            <Coins className='w-7 h-7 text-mango-400' />
            <p
              className='text-mango-400 font-bold text-lg'
              aria-label='product price'
            >
              {product.price.toLocaleString()}
            </p>
          </div>
          <CardDescription>
            {product.stock.toLocaleString()} disponibles
          </CardDescription>
        </CardContent>
        <CardFooter className='px-3 flex-col gap-2'>
          <Button
            tabIndex={-1}
            className='w-full text-sm font-bold bg-green-600 hover:bg-green-700'
          >
            Comprar
          </Button>
        </CardFooter>
      </Card>
  )
}
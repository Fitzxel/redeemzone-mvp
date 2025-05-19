import { useState } from 'react'
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card'
import Coins from './icons/Coins'
import CreateProduct from '@/components/panel/CreateProduct.tsx'
import BuyProduct from '@/components/BuyProduct.tsx'

interface Props {
  userLegacy: User | null
  store: Store
  productLegacy: Product
  fromStore?: boolean
  onCreate?: () => void
}

export default ({ userLegacy, store, productLegacy, fromStore, onCreate }: Props) => {
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(productLegacy)

  const reloadProduct = async () => {
    setLoading(true)
    const product = await fetch(`/api/product?productId=${productLegacy.id}`).then(res => res.json())
    setProduct(product)
    setLoading(false)
  }

  return (
    <Card className='w-72 min-h-96 py-3 gap-1'>
      <CardContent className='mb-2 flex-1 flex flex-col items-center gap-3'>
        <img
          src={product.imageUrl}
          alt={product.name}
          className='w-full h-auto max-h-48 object-contain'
        />
        <div className='text-center'>
          <CardTitle className='text-2xl font-bold'>
            {product.name}
          </CardTitle>
          <CardDescription className='text-base'>
            {product.description}
          </CardDescription>
        </div>
        <div className='flex justify-center items-center gap-2'>
          {
            store.coin.imageUrl ? 
            <img
              src={store.coin.imageUrl}
              alt='coin image'
              className='w-7 h-7'
            /> :
            <Coins className='w-7 h-7 text-mango-400' />
          }
          <p
            className='text-mango-400 font-bold text-2xl'
            aria-label='product price'
          >
            {product.price.toLocaleString()}
          </p>
        </div>
        {
          !product.infiniteStock &&
          <CardDescription>
            {product.stock.toLocaleString()} disponibles
          </CardDescription>
        }
      </CardContent>
      <CardFooter className='px-3 flex-col gap-2'>
        {
          fromStore &&
          <BuyProduct
            disabled={loading}
            store={store}
            product={product}
            onBuy={reloadProduct}
          />
        }
        {
          product.storeId === userLegacy?.publicMetadata?.yourStoreId &&
          <CreateProduct
            disabled={loading}
            product={product}
            store={store}
            onCreate={onCreate}
          />
        }
      </CardFooter>
    </Card>
  )
}
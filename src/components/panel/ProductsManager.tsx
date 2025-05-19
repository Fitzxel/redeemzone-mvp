import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import CreateProduct from '@/components/panel/CreateProduct.tsx'

interface Props {
  userLegacy: User
  store: Store
}

export default ({ userLegacy, store }: Props) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([] as Product[])

  const fetchProducts = async () => {
    if (!store) return

    setLoading(true)
    const res = await fetch(`/api/product?storeId=${store.id}`)
    const data = await res.json()
    setLoading(false)
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <>
      <div className='flex justify-between items-center'>
        <h2 className='text-lg font-bold'>
          Tus productos
        </h2>
        <CreateProduct store={store} onCreate={fetchProducts} />
      </div>
      <div className='flex flex-wrap gap-4'>
        {
          loading &&
          <>
            <Skeleton className='w-72 h-96  rounded-xl' />
            <Skeleton className='w-72 h-96  rounded-xl' />
            <Skeleton className='w-72 h-96  rounded-xl' />
          </>
        }
        {
          !loading && products.map((product) => (
            <ProductCard
              key={product.id}
              userLegacy={userLegacy}
              store={store}
              productLegacy={product}
              onCreate={fetchProducts}
            />
          ))
        }
      </div>
    </>
  )
}
import { useMemo } from 'react'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'
import CoinImage from './CoinImage'
import Infinity from './icons/Infinite'

interface Props {
  store: Store
  userLegacy?: User | null
}

export default ({ store, userLegacy }: Props) => {
  const user = useStore($userStore) as User | null
  const coins = useMemo(() => user?.publicMetadata?.wallet[store.id] || userLegacy?.publicMetadata?.wallet[store.id] || 0, [user, userLegacy])

  return (
    <div className='w-fit py-2 px-3 flex justify-center items-center gap-2 bg-card rounded-md border-1 border-mango-400 text-mango-400'>
      <CoinImage coin={store.coin} />
      <p className='text-xs'>
        {store.coin.name}
        <br />
        <span className='text-base font-bold'>
          {
            userLegacy?.publicMetadata?.yourStoreId === store.id
            ? <Infinity />
            : coins.toLocaleString()
          }
        </span>
      </p>
    </div>
  )
}
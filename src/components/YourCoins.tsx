import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'
import Coins from './icons/Coins'
import Infinity from './icons/Infinity'

export default ({ store }: { store: Store }) => {
  const user = useStore($userStore) as User

  return (
    <div className='w-fit py-2 px-3 flex justify-center items-center gap-2 bg-card rounded-md border-1 border-mango-400 text-mango-400'>
      {
        store.coin.imageUrl ? 
        <img
          src={store.coin.imageUrl}
          alt='coin image'
          className='w-7 h-7'
        /> :
        <Coins className='w-7 h-7' />
      }
      <p className='text-xs'>
        {store.coin.name}
        <br />
        <span className='text-base font-bold'>
          {
            user?.publicMetadata?.yourStoreId === store.id
            ? <Infinity />
            : user?.publicMetadata?.wallet[store.id].toLocaleString()
          }
        </span>
      </p>
    </div>
  )
}
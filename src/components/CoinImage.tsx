import Coins from "./icons/Coins"
import { cn } from "@/lib/utils"

interface Props {
  coin: Coin
  className?: string
}

export default ({ coin, className }: Props) => {
  return (
    <>
      {
        coin.imageUrl ? 
        <img
          src={coin.imageUrl}
          alt='coin image'
          className={cn(
            'w-7 h-7',
            className
          )}
        /> :
        <Coins className={cn('w-7 h-7', className)} />
      }
    </>
  )
}
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { EllipsisVertical, Trash2 } from 'lucide-react'

interface Props {
  onDelete: () => void
  reward: Reward
  twToken: string
}

export default ({ onDelete, reward, twToken }: Props) => {
  const deleteReward = async () => {
    await fetch('/api/rewards', {
      method: 'DELETE',
      body: JSON.stringify({
        twToken,
        rewards: [{
          id: reward.id,
          cost: reward.cost,
        }]
      }),
    })
    onDelete()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={deleteReward}
          variant='destructive'
        >
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
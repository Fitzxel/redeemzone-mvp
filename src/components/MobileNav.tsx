import { Menu } from 'lucide-react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NAV_ITEMS, NAV_ITEMS_ACCOUNT } from '@/data/nav.data'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'

export default () => {
  const user = useStore($userStore)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="lg:hidden !px-0">
          <Menu className="!w-6 !h-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <nav className="flex flex-col gap-2 p-4">
          {
            NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/10 dark:hover:bg-muted/5"
              >
                {item.name}
              </a>
            ))
          }
          <Separator />
          {
            user && NAV_ITEMS_ACCOUNT.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/10 dark:hover:bg-muted/5"
              >
                {item.name}
              </a>
            ))
          }
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
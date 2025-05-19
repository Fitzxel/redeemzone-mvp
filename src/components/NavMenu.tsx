import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

interface Props {
  pathname: string
  items?: {
    name: string
    href: string
  }[]
}

export default ({ pathname, items }: Props) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {
          items?.map((item) => (
            <NavigationMenuItem key={item.name}>
              <NavigationMenuLink
                href={item.href}
                data-active={item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)}
                className={navigationMenuTriggerStyle()}
              >
                {item.name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))
        }
      </NavigationMenuList>
    </NavigationMenu>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/theme/mode-toggle'
import { FileText, BarChart3, Upload, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

/**
 * Componente Header: Cabeçalho da aplicação com navegação
 */
export function Header() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
    },
    {
      href: ROUTES.EXTRATOS,
      label: 'Extratos',
      icon: <FileText className="h-5 w-5 mr-2" />,
    },
    {
      href: ROUTES.UPLOAD,
      label: 'Upload',
      icon: <Upload className="h-5 w-5 mr-2" />,
    },
  ]

  // Verifica se o caminho atual corresponde ao item de navegação
  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.HOME}
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <FileText className="h-6 w-6" />
            <span>Extratos Portuários</span>
          </Link>
        </div>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center text-sm font-medium transition-colors hover:text-primary',
                isActive(item) ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <ModeToggle />
        </nav>

        {/* Menu móvel */}
        <div className="flex items-center md:hidden">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center w-full">
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

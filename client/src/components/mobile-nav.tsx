
import React from 'react'
import { Home, Settings, MessageSquare, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocation, Link } from 'wouter'
import { useIsMobile } from '@/hooks/use-mobile'

export function MobileNav() {
  const isMobile = useIsMobile()
  const [location] = useLocation()

  if (!isMobile) return null

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Zap, label: 'Workflows', path: '/workflows' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link key={path} href={path}>
            <Button
              variant={location === path ? 'default' : 'ghost'}
              size="sm"
              className="mobile-button flex-col gap-1 h-auto py-2"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun, User, LogOut, Menu, X, Settings, Bus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { themeName, toggleTheme } = useTheme()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href={(isAuthenticated && user?.role === 'client') ? "/homepage" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Bus className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">BusBooking</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={(isAuthenticated && user?.role === 'client') ? "/homepage" : "/"}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/booking/lookup"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Booking Lookup
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    href="/booking"
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  >
                    My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Section - Auth & Theme */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex"
              title={themeName === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {themeName === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Authenticated User - Desktop */}
            {isAuthenticated && user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.username || user?.email} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {user?.username || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme}>
                      {themeName === 'light' ? (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      ) : (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Guest User - Desktop */
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-sm font-medium"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <nav className="flex flex-col gap-3">
              <Link
                href={isAuthenticated ? "/homepage" : "/"}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setShowMenu(false)}
              >
                Home
              </Link>

              {!isAuthenticated && (
                <Link
                  href="/booking/lookup"
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  Booking Lookup
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/booking"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Settings
                  </Link>

                  <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

                  {/* User Info */}
                  <div className="px-3 py-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.username || user?.email} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {themeName === 'light' ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    )}
                  </button>

                  {/* Logout */}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleLogout()
                      setShowMenu(false)
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                /* Guest Mobile Menu */
                <>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {themeName === 'light' ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    )}
                  </button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push('/login')
                      setShowMenu(false)
                    }}
                    className="w-full justify-center"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/register')
                      setShowMenu(false)
                    }}
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Register
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

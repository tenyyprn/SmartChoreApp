// Dark mode theme service
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedTheme = localStorage.getItem('smart-chore-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // システム設定を確認
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    // HTML要素にテーマクラスを適用
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('smart-chore-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme-aware components
export const ThemedCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        shadow-sm dark:shadow-gray-900/25
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export const ThemedText = ({ children, className = '', variant = 'body', ...props }) => {
  const variants = {
    title: 'text-gray-900 dark:text-white',
    subtitle: 'text-gray-700 dark:text-gray-300',
    body: 'text-gray-600 dark:text-gray-400',
    caption: 'text-gray-500 dark:text-gray-500'
  }

  return (
    <span 
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export const ThemedButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: `
      bg-primary-600 hover:bg-primary-700 
      dark:bg-primary-500 dark:hover:bg-primary-600
      text-white
    `,
    secondary: `
      bg-gray-200 hover:bg-gray-300 
      dark:bg-gray-700 dark:hover:bg-gray-600
      text-gray-900 dark:text-white
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      dark:hover:bg-gray-800
      text-gray-900 dark:text-white
    `
  }

  return (
    <button 
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

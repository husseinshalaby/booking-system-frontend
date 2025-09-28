'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface QueryParams {
  [key: string]: string | string[]
}

export function useQueryParams<T extends QueryParams>(defaults: T) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const queryParams = useMemo(() => {
    const result = { ...defaults }
    
    Object.keys(defaults).forEach((key) => {
      const value = searchParams.get(key)
      if (value !== null) {
        (result as any)[key] = value
      }
    })
    
    return result
  }, [searchParams, defaults])

  const setQueryParam = useCallback(
    (key: keyof T) => (value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key as string)
      } else {
        const stringValue = Array.isArray(value) ? value.join(',') : value
        params.set(key as string, stringValue)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.push(newUrl, { scroll: false })
    },
    [router, searchParams, pathname]
  )

  const setQueryParams = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || (Array.isArray(value) && value.length === 0)) {
          params.delete(key)
        } else {
          const stringValue = Array.isArray(value) ? value.join(',') : value as string
          params.set(key, stringValue)
        }
      })

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.push(newUrl, { scroll: false })
    },
    [router, searchParams, pathname]
  )

  const resetQueryParams = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  return {
    ...queryParams,
    setQueryParam,
    setQueryParams,
    resetQueryParams,
  }
}
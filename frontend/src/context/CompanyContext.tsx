import { createContext, useContext, ReactNode } from 'react'
import type { CompanyInfo } from '../types'
import { companyAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'

interface CompanyContextValue {
  company: CompanyInfo | null
  loading: boolean
  error: string | null
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useFetch<CompanyInfo>(companyAPI.getInfo)
  return (
    <CompanyContext.Provider value={{ company: data, loading, error }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider')
  return ctx
}

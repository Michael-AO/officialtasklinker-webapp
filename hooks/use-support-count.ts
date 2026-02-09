import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface SupportCounts {
  total: number
  pending: number
  inProgress: number
  resolved: number
  closed: number
}

export function useSupportCount() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<SupportCounts>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })
  const [loading, setLoading] = useState(false)

  const fetchSupportCounts = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/support-requests', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const supportRequests = data.supportRequests || []
        
        const newCounts = {
          total: supportRequests.length,
          pending: supportRequests.filter((r: any) => r.status === 'pending').length,
          inProgress: supportRequests.filter((r: any) => r.status === 'in_progress').length,
          resolved: supportRequests.filter((r: any) => r.status === 'resolved').length,
          closed: supportRequests.filter((r: any) => r.status === 'closed').length,
        }
        
        setCounts(newCounts)
      }
    } catch (error) {
      console.error('Error fetching support counts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSupportCounts()
  }, [user?.id])

  return {
    counts,
    loading,
    refetch: fetchSupportCounts
  }
} 
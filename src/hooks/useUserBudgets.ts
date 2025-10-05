import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@config/firebase'

async function fetchBudgets(uid: string) {
  const q = query(collection(db, 'budgets'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function useUserBudgets(uid?: string) {
  return useQuery({
    queryKey: ['budgets', uid],
    queryFn: () => fetchBudgets(uid as string),
    enabled: !!uid
  })
}

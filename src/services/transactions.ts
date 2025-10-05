import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export async function fetchTransactionsPage(userId: string, pageSize = 50, cursor?: DocumentSnapshot) {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(pageSize)
  )
  if (cursor) q = query(q, startAfter(cursor))

  const snap = await getDocs(q)
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const nextCursor = snap.docs[snap.docs.length - 1]
  return { items, nextCursor }
}



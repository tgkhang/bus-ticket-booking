export type RecentSearchItem = {
  id: string
  fromText: string
  toText: string
  originStopId?: string
  destinationStopId?: string
  date: string // YYYY-MM-DD
  passengers: number
  createdAt: number
}

const STORAGE_KEY = 'recentSearches'
const MAX_ITEMS = 4

const safeParse = (raw: string | null): unknown => {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const loadRecentSearches = (): RecentSearchItem[] => {
  if (typeof window === 'undefined') return []

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY))
  if (!Array.isArray(parsed)) return []

  const items: RecentSearchItem[] = []
  for (const it of parsed) {
    if (!it || typeof it !== 'object') continue

    const anyIt = it as any
    if (typeof anyIt.id !== 'string') continue
    if (typeof anyIt.fromText !== 'string' || typeof anyIt.toText !== 'string') continue
    if (typeof anyIt.date !== 'string') continue
    if (typeof anyIt.passengers !== 'number') continue

    items.push({
      id: anyIt.id,
      fromText: anyIt.fromText,
      toText: anyIt.toText,
      originStopId: typeof anyIt.originStopId === 'string' ? anyIt.originStopId : undefined,
      destinationStopId:
        typeof anyIt.destinationStopId === 'string' ? anyIt.destinationStopId : undefined,
      date: anyIt.date,
      passengers: anyIt.passengers,
      createdAt: typeof anyIt.createdAt === 'number' ? anyIt.createdAt : Date.now(),
    })
  }

  // newest first, max 4
  return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_ITEMS)
}

export const saveRecentSearches = (items: RecentSearchItem[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

const buildDedupKey = (item: Omit<RecentSearchItem, 'id' | 'createdAt'>) => {
  const fromKey = item.originStopId || item.fromText
  const toKey = item.destinationStopId || item.toText
  return `${fromKey}::${toKey}::${item.date}::${item.passengers}`
}

export const addRecentSearch = (item: Omit<RecentSearchItem, 'id' | 'createdAt'>) => {
  const current = loadRecentSearches()
  const key = buildDedupKey(item)

  const next: RecentSearchItem[] = [
    {
      id: `${Date.now()}`,
      createdAt: Date.now(),
      ...item,
    },
    ...current.filter((x) => buildDedupKey(x) !== key),
  ].slice(0, MAX_ITEMS)

  saveRecentSearches(next)
  return next
}

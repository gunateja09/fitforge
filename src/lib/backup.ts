// Full data backup / restore. LocalStorage is wiped by a cache clear, so a
// one-tap JSON export is the safety net. Also exports training history as CSV.

import { getPhotoBlob, putPhoto } from './photoStore'

const STORAGE_KEY = 'fitforge-v1'

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const res = await fetch(dataURL)
  return res.blob()
}

function stamp(): string {
  // Date.now-free: derive from a fresh ISO via performance origin is overkill;
  // browsers allow new Date() at runtime in the app (only workflow scripts ban it).
  return new Date().toISOString().slice(0, 10)
}

/**
 * Full backup: the persisted app state PLUS progress-photo images (which live
 * in IndexedDB, not localStorage). Images are inlined as data URLs so a single
 * file is a complete restore point.
 */
export async function exportFullBackup() {
  const raw = localStorage.getItem(STORAGE_KEY) ?? '{}'
  let photoIds: string[] = []
  try {
    const parsed = JSON.parse(raw)
    photoIds = (parsed?.state?.progressPhotos ?? []).map((p: { id: string }) => p.id)
  } catch {
    /* ignore */
  }

  const photos: Record<string, string> = {}
  for (const id of photoIds) {
    const blob = await getPhotoBlob(id)
    if (blob) photos[id] = await blobToDataURL(blob)
  }

  const backup = {
    app: 'fitforge',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: JSON.parse(raw),
    photos,
  }
  download(`fitforge-backup-${stamp()}.json`, JSON.stringify(backup), 'application/json')
}

/**
 * Restore a backup. Accepts both the full format (with `app: 'fitforge'` and
 * inlined `photos`) and a bare persisted-state file.
 */
export async function importFullBackup(file: File): Promise<void> {
  const text = await file.text()
  const parsed = JSON.parse(text)

  // full backup format
  if (parsed?.app === 'fitforge' && parsed.state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.state))
    if (parsed.photos && typeof parsed.photos === 'object') {
      for (const [id, dataURL] of Object.entries(parsed.photos as Record<string, string>)) {
        const blob = await dataURLToBlob(dataURL)
        await putPhoto(id, blob)
      }
    }
    return
  }

  // bare persisted-state format (older export)
  if (parsed && typeof parsed === 'object' && 'state' in parsed) {
    localStorage.setItem(STORAGE_KEY, text)
    return
  }

  throw new Error('Not a FitForge backup file.')
}

interface StrengthLike {
  date: string
  exercise: string
  sets: { reps: number; weight: number }[]
}

export function exportStrengthCSV(strengthLog: StrengthLike[]) {
  const rows = [['date', 'exercise', 'set', 'reps', 'weight_kg', 'volume_kg']]
  for (const e of [...strengthLog].sort((a, b) => a.date.localeCompare(b.date))) {
    e.sets.forEach((s, i) => {
      rows.push([
        e.date,
        `"${e.exercise.replace(/"/g, '""')}"`,
        String(i + 1),
        String(s.reps),
        String(s.weight),
        String(s.reps * s.weight),
      ])
    })
  }
  download(`fitforge-training-${stamp()}.csv`, rows.map((r) => r.join(',')).join('\n'), 'text/csv')
}

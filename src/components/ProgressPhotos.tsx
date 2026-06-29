import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { deletePhoto, getPhotoURL, putPhoto } from '../lib/photoStore'
import { prettyDay, shiftDay, todayStr } from '../lib/dates'
import type { ProgressPhoto } from '../types'

const POSES: { value: ProgressPhoto['pose']; label: string }[] = [
  { value: 'front', label: 'Front relaxed' },
  { value: 'flexed', label: 'Front flexed' },
  { value: 'side', label: 'Side' },
  { value: 'other', label: 'Other' },
]

const REMIND_DAYS = 28

export default function ProgressPhotos() {
  const photos = useStore((s) => s.progressPhotos)
  const addProgressPhoto = useStore((s) => s.addProgressPhoto)
  const removeProgressPhoto = useStore((s) => s.removeProgressPhoto)

  const [urls, setUrls] = useState<Record<string, string>>({})
  const [pose, setPose] = useState<ProgressPhoto['pose']>('front')
  const fileRef = useRef<HTMLInputElement>(null)

  // load object URLs for all photos; revoke on cleanup
  useEffect(() => {
    let revoked: string[] = []
    let alive = true
    Promise.all(
      photos.map(async (p) => [p.id, await getPhotoURL(p.id)] as const),
    ).then((pairs) => {
      if (!alive) return
      const map: Record<string, string> = {}
      for (const [id, url] of pairs) if (url) { map[id] = url; revoked.push(url) }
      setUrls(map)
    })
    return () => {
      alive = false
      revoked.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [photos])

  const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date))
  const lastDate = sorted[0]?.date
  const due =
    !lastDate || lastDate <= shiftDay(todayStr(), -REMIND_DAYS)
  const daysSince = lastDate
    ? Math.round(
        (Date.parse(todayStr()) - Date.parse(lastDate)) / 86400000,
      )
    : null

  async function onFile(file: File) {
    const id = addProgressPhoto({ date: todayStr(), pose })
    await putPhoto(id, file)
    // refresh url for the new one
    const url = await getPhotoURL(id)
    if (url) setUrls((m) => ({ ...m, [id]: url }))
  }

  async function remove(p: ProgressPhoto) {
    await deletePhoto(p.id)
    removeProgressPhoto(p.id)
  }

  function remindMe() {
    if (!('Notification' in window)) return
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification('FitForge', {
          body: "Time for your monthly progress photo 📸 — same lighting, same pose.",
        })
      }
    })
  }

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <b>Progress photos</b>
        <button className="btn primary sm" onClick={() => fileRef.current?.click()}>
          📸 Add photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
            e.target.value = ''
          }}
        />
      </div>

      {due && (
        <div
          className="card"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', marginBottom: 12 }}
        >
          📸 <b>{lastDate ? `It's been ${daysSince} days.` : 'No photos yet.'}</b>{' '}
          Take this month's progress shot.
          <button className="btn sm" style={{ marginLeft: 8 }} onClick={remindMe}>
            Enable reminders
          </button>
        </div>
      )}

      <div className="faint" style={{ fontSize: 12, marginBottom: 10 }}>
        Same conditions every time: morning, after bathroom, before eating, same
        lighting. Shoot front-relaxed, front-flexed, and side.
      </div>

      <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
        {POSES.map((p) => (
          <span
            key={p.value}
            className={`chip ${pose === p.value ? 'active' : ''}`}
            onClick={() => setPose(p.value)}
          >
            {p.label}
          </span>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty" style={{ padding: 12 }}>
          Photos are the most honest progress signal — the mirror hides gradual change.
        </div>
      ) : (
        <div className="grid cols-3" style={{ gap: 8 }}>
          {sorted.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
              {urls[p.id] ? (
                <img
                  src={urls[p.id]}
                  alt={`${p.pose} ${p.date}`}
                  style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                />
              ) : (
                <div style={{ height: 150, borderRadius: 10, background: 'var(--bg-elev-2)' }} />
              )}
              <div
                style={{
                  position: 'absolute',
                  left: 6,
                  bottom: 6,
                  background: 'rgba(0,0,0,.6)',
                  borderRadius: 6,
                  padding: '2px 6px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {prettyDay(p.date)} · {p.pose}
              </div>
              <button
                className="icon-btn"
                onClick={() => remove(p)}
                aria-label="Delete photo"
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.55)' }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

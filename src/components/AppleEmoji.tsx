interface Props {
  emoji: string
  size?: number
  label?: string
}

/**
 * Renders an emoji in Apple's style on every platform (Windows/Android render
 * their own flat sets otherwise). Uses an Apple-styled emoji image CDN; if the
 * image can't load (offline), the browser falls back to the native glyph.
 */
export default function AppleEmoji({ emoji, size = 22, label }: Props) {
  return (
    <img
      src={`https://emojicdn.elk.sh/${encodeURIComponent(emoji)}?style=apple`}
      alt={label ?? emoji}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      onError={(e) => {
        // fall back to the native emoji glyph if the CDN is unreachable
        const img = e.currentTarget
        const span = document.createElement('span')
        span.textContent = emoji
        span.style.fontSize = `${size}px`
        img.replaceWith(span)
      }}
    />
  )
}

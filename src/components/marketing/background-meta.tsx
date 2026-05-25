const icons = [
  { src: '/brands/meta.png',      left: '7%',  top: '12%', size: 38, rotate: -15, opacity: 0.04, blur: 0,   dur: 12  },
  { src: '/brands/instagram.png', left: '88%', top: '6%',  size: 30, rotate: 20,  opacity: 0.03, blur: 0.5, dur: 14  },
  { src: '/brands/facebook.png',  left: '82%', top: '42%', size: 34, rotate: -10, opacity: 0.035,blur: 0,   dur: 11  },
  { src: '/brands/whatsapp.png',  left: '4%',  top: '58%', size: 28, rotate: 22,  opacity: 0.04, blur: 0,   dur: 13  },
  { src: '/brands/meta.png',      left: '78%', top: '74%', size: 22, rotate: 10,  opacity: 0.025,blur: 1,   dur: 15  },
  { src: '/brands/instagram.png', left: '68%', top: '18%', size: 40, rotate: -22, opacity: 0.03, blur: 0,   dur: 10  },
  { src: '/brands/facebook.png',  left: '28%', top: '78%', size: 20, rotate: 14,  opacity: 0.02, blur: 1,   dur: 16  },
  { src: '/brands/whatsapp.png',  left: '92%', top: '30%', size: 32, rotate: -18, opacity: 0.035,blur: 0,   dur: 12.5},
  { src: '/brands/meta.png',      left: '42%', top: '4%',  size: 26, rotate: 8,   opacity: 0.025,blur: 0.5, dur: 14  },
  { src: '/brands/instagram.png', left: '14%', top: '38%', size: 20, rotate: -12, opacity: 0.02, blur: 1,   dur: 17  },
  { src: '/brands/facebook.png',  left: '55%', top: '62%', size: 28, rotate: 16,  opacity: 0.03, blur: 0,   dur: 11.5},
  { src: '/brands/whatsapp.png',  left: '35%', top: '90%', size: 18, rotate: -8,  opacity: 0.02, blur: 0.5, dur: 15  },
]

export function BackgroundMeta() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {icons.map((ic, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={ic.src}
          alt=""
          style={{
            position: 'absolute',
            left: ic.left,
            top: ic.top,
            width: ic.size,
            height: ic.size,
            opacity: ic.opacity,
            transform: `rotate(${ic.rotate}deg)`,
            filter: ic.blur ? `blur(${ic.blur}px)` : undefined,
            animation: `axd-float ${ic.dur}s ease-in-out ${i * 0.6}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

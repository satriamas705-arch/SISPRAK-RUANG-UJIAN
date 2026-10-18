/**
 * High-fidelity vector SVG data URIs for default official Indonesian emblems:
 * 1. Logo Pemda (Pemerintah Daerah / Dinas Pendidikan)
 * 2. Logo Sekolah / Pendidikan (Tut Wuri Handayani style)
 */

export const DEFAULT_PEMDA_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Outer Shield -->
  <path d="M50 5 L88 20 C88 60, 68 85, 50 96 C32 85, 12 60, 12 20 Z" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
  <path d="M50 9 L84 22 C84 58, 66 81, 50 91 C34 81, 16 58, 16 22 Z" fill="#0f172a"/>
  
  <!-- Star at top -->
  <polygon points="50,18 53,27 62,27 55,32 58,41 50,36 42,41 45,32 38,27 47,27" fill="#eab308"/>
  
  <!-- Rice and Cotton Wreath -->
  <path d="M30 45 C28 60, 36 72, 48 76" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
  <path d="M70 45 C72 60, 64 72, 52 76" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Center Emblem (Torch / Monolith) -->
  <rect x="46" y="44" width="8" height="24" rx="2" fill="#f8fafc"/>
  <polygon points="50,35 44,44 56,44" fill="#ef4444"/>
  <polygon points="50,38 46,44 54,44" fill="#f59e0b"/>
  
  <!-- Ribbon at bottom -->
  <path d="M30 82 Q50 78 70 82 Q50 86 30 82 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <text x="50" y="84" font-family="sans-serif" font-size="4" font-weight="bold" text-anchor="middle" fill="#0f172a">PEMDA</text>
</svg>
`)}`;

export const DEFAULT_SCHOOL_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Outer Pentagon (Segi Lima Pendidikan) -->
  <polygon points="50,6 92,36 76,88 24,88 8,36" fill="#1e3a8a" stroke="#fbbf24" stroke-width="3"/>
  <polygon points="50,11 87,38 73,84 27,84 13,38" fill="#1e40af"/>
  
  <!-- Flaming Torch (Obor Pendidikan) -->
  <!-- Flame -->
  <path d="M50 20 C43 28, 44 36, 50 42 C56 36, 57 28, 50 20 Z" fill="#dc2626"/>
  <path d="M50 25 C46 30, 46 35, 50 39 C54 35, 54 30, 50 25 Z" fill="#f59e0b"/>
  
  <!-- Torch Handle -->
  <polygon points="47,43 53,43 51,58 49,58" fill="#f8fafc"/>
  <rect x="46" y="58" width="8" height="3" fill="#cbd5e1"/>
  
  <!-- Open Book (Buku Terbuka) -->
  <path d="M50 62 Q36 56 24 60 L24 74 Q36 70 50 75 Q64 70 76 74 L76 60 Q64 56 50 62 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
  <line x1="50" y1="62" x2="50" y2="75" stroke="#0284c7" stroke-width="2"/>
  
  <!-- Wings / Sayap Tut Wuri -->
  <path d="M22 46 C28 50, 35 54, 42 56" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M78 46 C72 50, 65 54, 58 56" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
  
  <text x="50" y="82" font-family="sans-serif" font-size="4.5" font-weight="bold" text-anchor="middle" fill="#fbbf24">TUT WURI HANDAYANI</text>
</svg>
`)}`;

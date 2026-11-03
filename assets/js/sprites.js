/* ==========================================================================
   DRAG0N UNIVERSE VECTOR SPRITE & GRAPHICS ENGINE (2026)
   High-definition, retina-ready, scalable vector sprites & canvas renderers.
   Replaces all legacy Unicode text emojis with sleek game studio assets.
   ========================================================================== */

(function(global) {
  'use strict';

  const SPRITES = {};

  // -------------------------------------------------------------------------
  // 1. CURRENCY & STATUS TOKENS
  // -------------------------------------------------------------------------
  SPRITES.DRAGON_COIN = (size = 32) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
      <defs>
        <radialGradient id="dc_gold_outer" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </radialGradient>
        <linearGradient id="dc_inner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef9c3"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#dc_gold_outer)" stroke="#78350f" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#fef08a" stroke-width="1.2" stroke-dasharray="2 1.5"/>
      <circle cx="20" cy="20" r="12" fill="url(#dc_inner)"/>
      <path d="M15 25 C14 20, 16 16, 20 13 C22 14.5, 23 16.5, 21.5 18 C24 16, 27 17.5, 26 21 C24.5 20, 22 21, 23.5 24 C20 23, 17 26, 15 25 Z" fill="#78350f"/>
      <circle cx="18" cy="16" r="1" fill="#fef08a"/>
    </svg>
  `;

  SPRITES.AETHER_CRYSTAL = (size = 32) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
      <defs>
        <linearGradient id="aeth_top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
        <linearGradient id="aeth_bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <g>
        <polygon points="20,4 29,14 11,14" fill="#bae6fd"/>
        <polygon points="11,14 20,4 20,22" fill="#7dd3fc"/>
        <polygon points="29,14 20,4 20,22" fill="url(#aeth_top)"/>
        <polygon points="11,14 20,22 20,36 6,18" fill="url(#aeth_bot)"/>
        <polygon points="29,14 20,22 20,36 34,18" fill="#0284c7"/>
        <polygon points="20,22 29,14 34,18 20,36" fill="#0369a1"/>
        <polygon points="20,22 11,14 6,18 20,36" fill="#075985"/>
        <circle cx="18" cy="12" r="1.5" fill="#ffffff" opacity="0.9"/>
      </g>
    </svg>
  `;

  SPRITES.SANCTUARY_HEART = (size = 32) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
      <defs>
        <radialGradient id="sh_grad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fca5a5"/>
          <stop offset="45%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </radialGradient>
      </defs>
      <path d="M20 34 C12 28, 4 21, 4 13 C4 7.5, 8.5 4, 14 4 C17.2 4, 19.2 5.8, 20 7.2 C20.8 5.8, 22.8 4, 26 4 C31.5 4, 36 7.5, 36 13 C36 21, 28 28, 20 34 Z"
            fill="url(#sh_grad)" stroke="#ffffff" stroke-width="1.5"/>
      <path d="M12 9 C9 11, 8 14, 8 16" stroke="#fecaca" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  SPRITES.RANK_STAR = (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
      <defs>
        <linearGradient id="star_g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="40%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
      </defs>
      <polygon points="16,2 20.3,11.2 30.2,12.5 22.9,19.3 24.8,29.2 16,24.2 7.2,29.2 9.1,19.3 1.8,12.5 11.7,11.2"
               fill="url(#star_g)" stroke="#713f12" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="16" cy="15" r="2.5" fill="#ffffff" opacity="0.6"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 2. AETHER SIEGE 18 HERO ARCHETYPES
  // -------------------------------------------------------------------------
  SPRITES.HERO_BLADEDANCER = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bd_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
        <linearGradient id="blade_cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#bd_bg)" stroke="#38bdf8" stroke-width="2"/>
      <path d="M12 44 C16 32, 28 20, 48 12 C44 24, 32 36, 12 44 Z" fill="url(#blade_cyan)" stroke="#e0f2fe" stroke-width="1.5"/>
      <path d="M48 44 C44 32, 32 20, 12 12 C16 24, 28 36, 48 44 Z" fill="url(#blade_cyan)" stroke="#e0f2fe" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <circle cx="30" cy="30" r="3" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.HERO_DEMONHUNTER = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dh_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#7e22ce" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#dh_bg)" stroke="#a855f7" stroke-width="2"/>
      <path d="M20 22 C16 12, 10 10, 8 14 C12 20, 16 26, 20 26 Z" fill="#6b21a8" stroke="#d8b4fe" stroke-width="1.2"/>
      <path d="M40 22 C44 12, 50 10, 52 14 C48 20, 44 26, 40 26 Z" fill="#6b21a8" stroke="#d8b4fe" stroke-width="1.2"/>
      <path d="M20 26 C20 18, 40 18, 40 26 C40 38, 30 46, 30 46 C30 46, 20 38, 20 26 Z" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
      <ellipse cx="25" cy="28" rx="3.5" ry="2" fill="#ef4444"/>
      <circle cx="25" cy="28" r="1.2" fill="#fef08a"/>
      <ellipse cx="35" cy="28" rx="3.5" ry="2" fill="#ef4444"/>
      <circle cx="35" cy="28" r="1.2" fill="#fef08a"/>
      <polygon points="30,36 34,42 26,42" fill="#a855f7"/>
    </svg>
  `;

  SPRITES.HERO_HARLEQUIN = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hq_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e11d48" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#hq_bg)" stroke="#f43f5e" stroke-width="2"/>
      <path d="M30 18 C24 8, 12 12, 10 20 C18 20, 26 22, 30 28 Z" fill="#f43f5e"/>
      <circle cx="10" cy="20" r="3" fill="#fbbf24"/>
      <path d="M30 18 C36 8, 48 12, 50 20 C42 20, 34 22, 30 28 Z" fill="#1e293b"/>
      <circle cx="50" cy="20" r="3" fill="#fbbf24"/>
      <path d="M22 28 C22 24, 30 24, 30 28 L30 46 C26 44, 22 38, 22 28 Z" fill="#f43f5e"/>
      <path d="M38 28 C38 24, 30 24, 30 28 L30 46 C34 44, 38 38, 38 28 Z" fill="#ffffff"/>
      <ellipse cx="26" cy="32" rx="2" ry="3" fill="#ffffff"/>
      <ellipse cx="34" cy="32" rx="2" ry="3" fill="#0f172a"/>
      <polygon points="30,46 22,52 26,45" fill="#fbbf24"/>
      <polygon points="30,46 38,52 34,45" fill="#fbbf24"/>
    </svg>
  `;

  SPRITES.HERO_DRYAD = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dry_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#dry_bg)" stroke="#10b981" stroke-width="2"/>
      <path d="M30 48 C20 44, 14 34, 16 22 C26 22, 32 30, 30 48 Z" fill="#10b981" stroke="#a7f3d0" stroke-width="1.5"/>
      <path d="M30 48 C40 44, 46 34, 44 22 C34 22, 28 30, 30 48 Z" fill="#34d399" stroke="#a7f3d0" stroke-width="1.5"/>
      <path d="M30 46 L30 14 C30 14, 34 8, 30 6 C26 8, 30 14, 30 14 Z" stroke="#6ee7b7" stroke-width="2.5" fill="#ecfdf5"/>
      <circle cx="30" cy="20" r="5" fill="#f472b6" stroke="#fff" stroke-width="1.5"/>
      <circle cx="30" cy="20" r="2" fill="#fde047"/>
    </svg>
  `;

  SPRITES.HERO_SCRAPPER = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="scr_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#scr_bg)" stroke="#f59e0b" stroke-width="2"/>
      <g stroke="#fef3c7" stroke-width="1.5" fill="#b45309">
        <circle cx="30" cy="30" r="16"/>
        <rect x="27" y="10" width="6" height="40" rx="1"/>
        <rect x="10" y="27" width="40" height="6" rx="1"/>
        <rect x="16" y="16" width="28" height="28" rx="2" transform="rotate(45 30 30)"/>
      </g>
      <circle cx="30" cy="30" r="8" fill="#ef4444" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="30" cy="30" r="4" fill="#fbbf24"/>
    </svg>
  `;

  SPRITES.HERO_BARD = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bd2_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#eab308" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#bd2_bg)" stroke="#fbbf24" stroke-width="2"/>
      <path d="M20 14 C16 26, 16 38, 22 46 C28 50, 32 50, 38 46 C44 38, 44 26, 40 14" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="18" x2="40" y2="18" stroke="#ca8a04" stroke-width="2"/>
      <line x1="26" y1="18" x2="26" y2="46" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
      <line x1="30" y1="18" x2="30" y2="48" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
      <line x1="34" y1="18" x2="34" y2="46" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
      <circle cx="42" cy="18" r="3" fill="#38bdf8"/>
      <path d="M45 18 L45 10 L50 8" stroke="#38bdf8" stroke-width="1.5" fill="none"/>
    </svg>
  `;

  SPRITES.HERO_VAMPIRE = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vamp_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#991b1b" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#vamp_bg)" stroke="#dc2626" stroke-width="2"/>
      <path d="M12 24 C18 16, 26 14, 30 20 C34 14, 42 16, 48 24 L42 46 C34 44, 26 44, 18 46 Z" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
      <path d="M22 24 C22 18, 38 18, 38 24 C38 32, 30 38, 30 38 C30 38, 22 32, 22 24 Z" fill="#f8fafc"/>
      <circle cx="26" cy="25" r="2" fill="#ef4444"/>
      <circle cx="34" cy="25" r="2" fill="#ef4444"/>
      <polygon points="27,31 28,34 29,31" fill="#ffffff"/>
      <polygon points="31,31 32,34 33,31" fill="#ffffff"/>
      <path d="M30 42 C27 45, 27 48, 30 50 C33 48, 33 45, 30 42 Z" fill="#ef4444"/>
    </svg>
  `;

  SPRITES.HERO_CULTIST = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cult_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#cult_bg)" stroke="#6366f1" stroke-width="2"/>
      <path d="M16 46 C16 28, 20 12, 30 12 C40 12, 44 28, 44 46 C38 48, 22 48, 16 46 Z" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
      <ellipse cx="30" cy="28" rx="8" ry="6" fill="#0f172a"/>
      <circle cx="30" cy="28" r="3.5" fill="#a855f7"/>
      <circle cx="30" cy="28" r="1.5" fill="#fdf4ff"/>
      <path d="M30 6 C28 9, 27 11, 30 14 C33 11, 32 9, 30 6 Z" fill="#c084fc"/>
    </svg>
  `;

  SPRITES.HERO_RIDINGHOOD = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rh_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#b91c1c" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#rh_bg)" stroke="#ef4444" stroke-width="2"/>
      <path d="M14 46 C14 26, 22 14, 30 14 C38 14, 46 26, 46 46 C38 48, 22 48, 14 46 Z" fill="#b91c1c" stroke="#fca5a5" stroke-width="1.5"/>
      <polygon points="20,16 16,8 24,14" fill="#475569"/>
      <polygon points="40,16 44,8 36,14" fill="#475569"/>
      <path d="M20 32 L36 46 M24 28 L40 42 M28 26 L44 40" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;

  SPRITES.HERO_MERMAID = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="merm_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0891b2" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#merm_bg)" stroke="#06b6d4" stroke-width="2"/>
      <path d="M22 20 L26 28 L30 18 L34 28 L38 20" stroke="#67e8f9" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M30 24 C30 34, 20 38, 20 46 C24 46, 28 42, 30 38 C32 42, 36 46, 40 46 C40 38, 30 34, 30 24 Z" fill="#06b6d4" stroke="#a5f3fc" stroke-width="1.5"/>
      <circle cx="30" cy="14" r="5" fill="#cffafe" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="28.5" cy="12.5" r="1.5" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.HERO_RANGER = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rng_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#rng_bg)" stroke="#38bdf8" stroke-width="2"/>
      <path d="M22 12 C14 22, 14 38, 22 48" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none"/>
      <line x1="22" y1="12" x2="34" y2="30" stroke="#bae6fd" stroke-width="1.2"/>
      <line x1="22" y1="48" x2="34" y2="30" stroke="#bae6fd" stroke-width="1.2"/>
      <line x1="16" y1="30" x2="46" y2="30" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="48,30 42,26 42,34" fill="#fef08a"/>
      <polygon points="18,30 14,26 14,34" fill="#38bdf8"/>
    </svg>
  `;

  SPRITES.HERO_PYRO = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pyr_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#dc2626" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#pyr_bg)" stroke="#ef4444" stroke-width="2"/>
      <path d="M30 8 C36 18, 48 24, 46 36 C44 46, 36 50, 30 50 C24 50, 16 46, 14 36 C12 24, 24 18, 30 8 Z" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <path d="M30 18 C34 24, 40 28, 38 38 C36 44, 32 46, 30 46 C28 46, 24 44, 22 38 C20 28, 26 24, 30 18 Z" fill="#f59e0b"/>
      <circle cx="30" cy="36" r="6" fill="#fef08a"/>
    </svg>
  `;

  SPRITES.HERO_TEMPEST = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tmp_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ca8a04" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#tmp_bg)" stroke="#eab308" stroke-width="2"/>
      <polygon points="32,8 18,30 28,30 24,52 42,26 30,26" fill="#fde047" stroke="#713f12" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="30" cy="30" r="18" fill="none" stroke="#fde047" stroke-width="1" stroke-dasharray="3 3"/>
    </svg>
  `;

  SPRITES.HERO_VENOM = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vnm_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#vnm_bg)" stroke="#10b981" stroke-width="2"/>
      <path d="M26 12 L34 12 L34 20 L44 38 C46 42, 44 48, 38 48 L22 48 C16 48, 14 42, 16 38 L26 20 Z" fill="#047857" stroke="#6ee7b7" stroke-width="2"/>
      <path d="M19 42 C24 40, 36 40, 41 42 L38 47 L22 47 Z" fill="#34d399"/>
      <circle cx="28" cy="36" r="2" fill="#a7f3d0"/>
      <circle cx="34" cy="32" r="1.5" fill="#a7f3d0"/>
    </svg>
  `;

  SPRITES.HERO_FROST = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="frs_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#frs_bg)" stroke="#8b5cf6" stroke-width="2"/>
      <g stroke="#ddd6fe" stroke-width="2" stroke-linecap="round">
        <line x1="30" y1="10" x2="30" y2="50"/>
        <line x1="10" y1="30" x2="50" y2="30"/>
        <line x1="16" y1="16" x2="44" y2="44"/>
        <line x1="16" y1="44" x2="44" y2="16"/>
        <path d="M26 16 L30 20 L34 16 M26 44 L30 40 L34 44"/>
        <path d="M16 26 L20 30 L16 34 M44 26 L40 30 L44 34"/>
      </g>
      <circle cx="30" cy="30" r="4" fill="#a78bfa" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `;

  SPRITES.HERO_GUARDIAN = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grd_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#grd_bg)" stroke="#f59e0b" stroke-width="2"/>
      <path d="M16 16 C26 14, 34 14, 44 16 L44 32 C44 42, 34 48, 30 50 C26 48, 16 42, 16 32 Z" fill="#b45309" stroke="#fef08a" stroke-width="2"/>
      <rect x="27" y="20" width="6" height="24" rx="1" fill="#fef08a"/>
      <rect x="20" y="26" width="20" height="6" rx="1" fill="#fef08a"/>
    </svg>
  `;

  SPRITES.HERO_SIPHON = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sph_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#sph_bg)" stroke="#0ea5e9" stroke-width="2"/>
      <polygon points="30,10 46,22 46,38 30,50 14,38 14,22" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="30,10 46,22 30,30 14,22" fill="#38bdf8" opacity="0.7"/>
      <polygon points="30,30 46,22 46,38 30,50" fill="#0284c7"/>
      <polygon points="30,30 14,22 14,38 30,50" fill="#075985"/>
      <circle cx="30" cy="30" r="3" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.HERO_ASSASSIN = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="asn_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#db2777" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#asn_bg)" stroke="#ec4899" stroke-width="2"/>
      <path d="M14 44 L26 32 M46 44 L34 32" stroke="#be185d" stroke-width="4" stroke-linecap="round"/>
      <polygon points="30,12 36,28 30,34 24,28" fill="#f472b6" stroke="#ffffff" stroke-width="1.5"/>
      <polygon points="30,48 24,32 30,26 36,32" fill="#db2777" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="4" fill="#ffffff"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 3. 5 AETHER SIEGE BOSS MONSTERS
  // -------------------------------------------------------------------------
  SPRITES.BOSS_GORGON = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
      <path d="M12 26 C12 16, 20 12, 26 18 M48 26 C48 16, 40 12, 34 18 M30 8 C26 14, 34 14, 30 20" stroke="#34d399" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="32" r="14" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
      <circle cx="25" cy="30" r="3" fill="#ef4444"/>
      <circle cx="35" cy="30" r="3" fill="#ef4444"/>
      <circle cx="25" cy="30" r="1" fill="#fde047"/>
      <circle cx="35" cy="30" r="1" fill="#fde047"/>
      <polygon points="27,38 28,42 29,38" fill="#fff"/>
      <polygon points="31,38 32,42 33,38" fill="#fff"/>
    </svg>
  `;

  SPRITES.BOSS_BEDLAM = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#4c0519" stroke="#f43f5e" stroke-width="2.5"/>
      <path d="M18 20 C10 10, 8 26, 18 28 M42 20 C50 10, 52 26, 42 28" stroke="#fb7185" stroke-width="2" fill="#be123c"/>
      <path d="M20 28 C20 18, 40 18, 40 28 C40 38, 36 44, 30 46 C24 44, 20 38, 20 28 Z" fill="#fecdd3" stroke="#e11d48" stroke-width="2"/>
      <circle cx="26" cy="28" r="4.5" fill="#0f172a"/>
      <circle cx="26" cy="28" r="2" fill="#f43f5e"/>
      <ellipse cx="34" cy="28" rx="2.5" ry="4" fill="#0f172a"/>
      <path d="M24 38 Q30 44 36 38" stroke="#881337" stroke-width="2.5" fill="none"/>
    </svg>
  `;

  SPRITES.BOSS_WARLOCK = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#2e1065" stroke="#a855f7" stroke-width="2.5"/>
      <polygon points="20,24 24,14 30,20 36,14 40,24" fill="#581c87" stroke="#d8b4fe" stroke-width="1.5"/>
      <path d="M18 48 C18 30, 24 22, 30 22 C36 22, 42 30, 42 48 Z" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
      <line x1="46" y1="12" x2="46" y2="50" stroke="#a855f7" stroke-width="3"/>
      <circle cx="46" cy="12" r="5" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/>
      <circle cx="30" cy="32" r="3" fill="#e879f9"/>
    </svg>
  `;

  SPRITES.BOSS_TRIBUNAL = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#451a03" stroke="#fbbf24" stroke-width="2.5"/>
      <line x1="30" y1="14" x2="30" y2="46" stroke="#fbbf24" stroke-width="3"/>
      <line x1="16" y1="20" x2="44" y2="20" stroke="#fde047" stroke-width="2.5"/>
      <line x1="16" y1="20" x2="12" y2="30" stroke="#fef08a" stroke-width="1"/>
      <line x1="16" y1="20" x2="20" y2="30" stroke="#fef08a" stroke-width="1"/>
      <path d="M10 30 C12 36, 20 36, 22 30 Z" fill="#d97706" stroke="#fbbf24" stroke-width="1.5"/>
      <line x1="44" y1="20" x2="40" y2="30" stroke="#fef08a" stroke-width="1"/>
      <line x1="44" y1="20" x2="48" y2="30" stroke="#fef08a" stroke-width="1"/>
      <path d="M38 30 C40 36, 48 36, 50 30 Z" fill="#d97706" stroke="#fbbf24" stroke-width="1.5"/>
    </svg>
  `;

  SPRITES.BOSS_PUPPETEER = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5"/>
      <rect x="27" y="10" width="6" height="24" rx="2" fill="#c7d2fe"/>
      <rect x="18" y="19" width="24" height="6" rx="2" fill="#c7d2fe"/>
      <line x1="19" y1="25" x2="16" y2="46" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <line x1="41" y1="25" x2="44" y2="46" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <line x1="30" y1="34" x2="30" y2="48" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <circle cx="30" cy="44" r="5" fill="#f8fafc" stroke="#4338ca" stroke-width="1.5"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 4. ROOM PETS & SCREEN COMPANIONS (10 Mascots)
  // -------------------------------------------------------------------------
  SPRITES.PET_CAT = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="18,22 12,10 24,16" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
      <polygon points="18,20 14,12 22,17" fill="#fda4af"/>
      <polygon points="42,22 48,10 36,16" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
      <polygon points="42,20 46,12 38,17" fill="#fda4af"/>
      <circle cx="30" cy="32" r="15" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
      <ellipse cx="25" cy="30" rx="2.5" ry="3.5" fill="#334155"/>
      <circle cx="24" cy="28.5" r="1" fill="#ffffff"/>
      <ellipse cx="35" cy="30" rx="2.5" ry="3.5" fill="#334155"/>
      <circle cx="34" cy="28.5" r="1" fill="#ffffff"/>
      <line x1="15" y1="32" x2="8" y2="30" stroke="#64748b" stroke-width="1.5"/>
      <line x1="15" y1="35" x2="7" y2="35" stroke="#64748b" stroke-width="1.5"/>
      <line x1="45" y1="32" x2="52" y2="30" stroke="#64748b" stroke-width="1.5"/>
      <line x1="45" y1="35" x2="53" y2="35" stroke="#64748b" stroke-width="1.5"/>
      <path d="M28 35 Q30 37 30 35 Q30 37 32 35" stroke="#334155" stroke-width="1.5" fill="none"/>
    </svg>
  `;

  SPRITES.PET_DRAGON = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#fdf4ff" stroke="#a855f7" stroke-width="2"/>
      <path d="M22 20 Q16 10 20 8 Q23 10 25 18 Z" fill="#facc15" stroke="#3b0764" stroke-width="1.5"/>
      <path d="M38 20 Q44 10 40 8 Q37 10 35 18 Z" fill="#facc15" stroke="#3b0764" stroke-width="1.5"/>
      <circle cx="30" cy="32" r="15" fill="#a855f7" stroke="#3b0764" stroke-width="2"/>
      <circle cx="21" cy="36" r="3" fill="#ec4899" opacity="0.7"/>
      <circle cx="39" cy="36" r="3" fill="#ec4899" opacity="0.7"/>
      <circle cx="25" cy="30" r="3.5" fill="#3b0764"/>
      <circle cx="24" cy="28.5" r="1.2" fill="#fff"/>
      <circle cx="35" cy="30" r="3.5" fill="#3b0764"/>
      <circle cx="34" cy="28.5" r="1.2" fill="#fff"/>
      <path d="M28 36 Q30 39 32 36" stroke="#3b0764" stroke-width="1.5" fill="none"/>
    </svg>
  `;

  SPRITES.PET_CYBER_PUPPY = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#ecfeff" stroke="#06b6d4" stroke-width="2"/>
      <polygon points="16,22 10,12 22,18" fill="#0891b2" stroke="#164e63" stroke-width="1.5"/>
      <polygon points="44,22 50,12 38,18" fill="#0891b2" stroke="#164e63" stroke-width="1.5"/>
      <rect x="18" y="20" width="24" height="22" rx="7" fill="#22d3ee" stroke="#083344" stroke-width="2"/>
      <rect x="20" y="26" width="20" height="9" rx="3" fill="#ec4899" stroke="#ffffff" stroke-width="1"/>
      <circle cx="25" cy="30.5" r="1.5" fill="#ffffff"/>
      <circle cx="35" cy="30.5" r="1.5" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.PET_BUNNY = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#fdf2f8" stroke="#f472b6" stroke-width="2"/>
      <rect x="20" y="6" width="7" height="22" rx="3.5" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
      <rect x="22" y="9" width="3" height="15" rx="1.5" fill="#fbcfe8"/>
      <rect x="33" y="6" width="7" height="22" rx="3.5" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
      <rect x="35" y="9" width="3" height="15" rx="1.5" fill="#fbcfe8"/>
      <circle cx="30" cy="34" r="14" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
      <ellipse cx="25" cy="32" rx="2" ry="3" fill="#334155"/>
      <ellipse cx="35" cy="32" rx="2" ry="3" fill="#334155"/>
      <polygon points="29,36 31,36 30,38" fill="#f43f5e"/>
    </svg>
  `;

  SPRITES.PET_FROG = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
      <circle cx="21" cy="20" r="7" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
      <circle cx="21" cy="20" r="3" fill="#14532d"/>
      <circle cx="20" cy="18.5" r="1" fill="#fff"/>
      <circle cx="39" cy="20" r="7" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
      <circle cx="39" cy="20" r="3" fill="#14532d"/>
      <circle cx="38" cy="18.5" r="1" fill="#fff"/>
      <ellipse cx="30" cy="34" rx="17" ry="13" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
      <path d="M22 36 Q30 42 38 36" stroke="#15803d" stroke-width="2" fill="none"/>
    </svg>
  `;

  SPRITES.PET_FOX = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
      <polygon points="17,20 12,8 24,15" fill="#c2410c"/>
      <polygon points="43,20 48,8 36,15" fill="#c2410c"/>
      <path d="M16 26 C16 18, 44 18, 44 26 C44 38, 30 46, 30 46 C30 46, 16 38, 16 26 Z" fill="#ea580c"/>
      <path d="M16 26 C16 38, 30 46, 30 46 C24 38, 18 34, 16 26 Z" fill="#ffffff"/>
      <path d="M44 26 C44 38, 30 46, 30 46 C36 38, 42 34, 44 26 Z" fill="#ffffff"/>
      <ellipse cx="23" cy="28" rx="2" ry="3" fill="#1e293b"/>
      <ellipse cx="37" cy="28" rx="2" ry="3" fill="#1e293b"/>
      <circle cx="30" cy="42" r="2.5" fill="#1e293b"/>
    </svg>
  `;

  SPRITES.PET_OWL = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#faf5ff" stroke="#a855f7" stroke-width="2"/>
      <polygon points="18,18 14,8 24,14" fill="#6b21a8"/>
      <polygon points="42,18 46,8 36,14" fill="#6b21a8"/>
      <circle cx="30" cy="32" r="15" fill="#7e22ce" stroke="#4c1d95" stroke-width="2"/>
      <circle cx="24" cy="30" r="6" fill="#ffffff" stroke="#fbbf24" stroke-width="1.5"/>
      <circle cx="24" cy="30" r="3" fill="#0f172a"/>
      <circle cx="36" cy="30" r="6" fill="#ffffff" stroke="#fbbf24" stroke-width="1.5"/>
      <circle cx="36" cy="30" r="3" fill="#0f172a"/>
      <polygon points="28,36 32,36 30,40" fill="#f59e0b"/>
    </svg>
  `;

  SPRITES.PET_SHARK = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
      <polygon points="30,8 26,20 38,20" fill="#0369a1" stroke="#075985" stroke-width="1.5"/>
      <ellipse cx="30" cy="34" rx="16" ry="12" fill="#0284c7" stroke="#075985" stroke-width="2"/>
      <ellipse cx="30" cy="38" rx="12" ry="7" fill="#ffffff"/>
      <circle cx="22" cy="32" r="2.5" fill="#0f172a"/>
      <circle cx="21" cy="31" r="0.8" fill="#fff"/>
      <path d="M26 38 L28 36 L30 38 L32 36 L34 38" stroke="#0f172a" stroke-width="1.5" fill="none"/>
    </svg>
  `;

  SPRITES.PET_UNICORN = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#fdf2f8" stroke="#ec4899" stroke-width="2"/>
      <polygon points="30,6 27,20 33,20" fill="#fde047" stroke="#d97706" stroke-width="1.5"/>
      <line x1="28" y1="12" x2="32" y2="10" stroke="#d97706" stroke-width="1.5"/>
      <line x1="28" y1="16" x2="32" y2="14" stroke="#d97706" stroke-width="1.5"/>
      <circle cx="30" cy="34" r="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M20 22 C14 26, 12 34, 16 42" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="34" cy="32" rx="2.5" ry="3.5" fill="#3b0764"/>
      <circle cx="33" cy="30.5" r="1" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.PET_SLIME = (size = 40) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
      <path d="M14 42 C12 30, 20 18, 30 18 C40 18, 48 30, 46 42 C40 46, 20 46, 14 42 Z" fill="#34d399" stroke="#059669" stroke-width="2"/>
      <path d="M30 18 C30 12, 34 8, 38 10 C36 14, 32 16, 30 18 Z" fill="#10b981"/>
      <circle cx="24" cy="32" r="3" fill="#064e3b"/>
      <circle cx="23" cy="30.5" r="1" fill="#ffffff"/>
      <circle cx="36" cy="32" r="3" fill="#064e3b"/>
      <circle cx="35" cy="30.5" r="1" fill="#ffffff"/>
      <circle cx="30" cy="36" r="2" fill="#059669"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 5. SCREEN TOYS & BIOMES
  // -------------------------------------------------------------------------
  SPRITES.TOY_YARN = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill="#f43f5e" stroke="#9f1239" stroke-width="1.5"/>
      <path d="M10 14 C16 26, 28 26, 30 12" stroke="#fda4af" stroke-width="2" fill="none"/>
      <path d="M8 24 C20 14, 28 32, 32 20" stroke="#fecdd3" stroke-width="2" fill="none"/>
      <path d="M26 32 C30 38, 36 34, 38 38" stroke="#f43f5e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  SPRITES.TOY_TREAT = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="28" r="3.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <circle cx="14" cy="32" r="3.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="12" y1="30" x2="20" y2="22" stroke="#f8fafc" stroke-width="4"/>
      <ellipse cx="25" cy="17" rx="10" ry="8" fill="#d97706" stroke="#92400e" stroke-width="1.5" transform="rotate(-35 25 17)"/>
      <circle cx="23" cy="14" r="2" fill="#fef3c7" opacity="0.6"/>
    </svg>
  `;

  SPRITES.TOY_LASER = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lsr_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="60%" stop-color="#ef4444" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="6" y="24" width="20" height="6" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.5" transform="rotate(-45 6 24)"/>
      <circle cx="28" cy="12" r="10" fill="url(#lsr_glow)"/>
      <circle cx="28" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `;

  SPRITES.BIOME_LOBBY = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="20,8 9,18 31,18" fill="#38bdf8"/>
      <rect x="13" y="18" width="14" height="12" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
      <rect x="17" y="22" width="6" height="8" fill="#38bdf8"/>
    </svg>
  `;

  SPRITES.BIOME_VOID = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#090514" stroke="#c084fc" stroke-width="1.5"/>
      <path d="M12 24 C14 16, 26 14, 28 20 C30 26, 22 28, 20 22" stroke="#e879f9" stroke-width="2" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="12" r="1" fill="#fff"/>
      <circle cx="32" cy="14" r="1.5" fill="#fde047"/>
      <circle cx="28" cy="30" r="1" fill="#fff"/>
    </svg>
  `;

  SPRITES.BIOME_FOREST = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
      <rect x="18" y="24" width="4" height="8" fill="#78350f"/>
      <polygon points="20,8 11,20 29,20" fill="#10b981"/>
      <polygon points="20,13 13,24 27,24" fill="#059669"/>
    </svg>
  `;

  SPRITES.BIOME_TUNDRA = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#082f49" stroke="#7dd3fc" stroke-width="1.5"/>
      <polygon points="8,32 16,18 24,32" fill="#38bdf8"/>
      <polygon points="18,32 26,14 34,32" fill="#e0f2fe"/>
      <circle cx="20" cy="12" r="1.5" fill="#fff"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 6. SHOP ITEMS & PLAYGROUND FURNITURE
  // -------------------------------------------------------------------------
  SPRITES.SHOP_GOLD_CHAT = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(251, 191, 36, 0.12)" stroke="#fbbf24" stroke-width="2"/>
      <path d="M14 24 C14 18, 46 18, 46 24 C46 36, 32 36, 26 40 L26 36 L20 36 C16 36, 14 32, 14 24 Z" fill="#d97706" stroke="#fef08a" stroke-width="1.5"/>
      <text x="30" y="28" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="'Outfit', sans-serif">GOLD</text>
    </svg>
  `;

  SPRITES.SHOP_FIRE_BORDER = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" stroke-width="2"/>
      <circle cx="30" cy="30" r="16" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 2"/>
      <path d="M30 12 C34 20, 42 22, 40 32 C38 40, 32 44, 30 44 C26 44, 22 38, 24 30 Z" fill="#ef4444" opacity="0.8"/>
    </svg>
  `;

  SPRITES.SHOP_VIP = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(168, 85, 247, 0.12)" stroke="#a855f7" stroke-width="2"/>
      <polygon points="14,36 14,24 22,29 30,16 38,29 46,24 46,36" fill="#f59e0b" stroke="#fef08a" stroke-width="2" stroke-linejoin="round"/>
      <rect x="14" y="36" width="32" height="6" rx="2" fill="#d97706" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="30" cy="16" r="2" fill="#ef4444"/>
      <circle cx="14" cy="24" r="2" fill="#38bdf8"/>
      <circle cx="46" cy="24" r="2" fill="#38bdf8"/>
    </svg>
  `;

  SPRITES.FURNITURE_BED = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(192, 132, 252, 0.12)" stroke="#c084fc" stroke-width="2"/>
      <rect x="12" y="14" width="3" height="34" rx="1" fill="#fbbf24"/>
      <rect x="45" y="14" width="3" height="34" rx="1" fill="#fbbf24"/>
      <rect x="12" y="14" width="36" height="4" rx="1" fill="#fbbf24"/>
      <rect x="15" y="32" width="30" height="14" rx="4" fill="#7e22ce" stroke="#d8b4fe" stroke-width="1.5"/>
      <rect x="17" y="27" width="10" height="6" rx="3" fill="#fdf4ff"/>
      <rect x="33" y="27" width="10" height="6" rx="3" fill="#fdf4ff"/>
    </svg>
  `;

  SPRITES.FURNITURE_CONSOLE = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(6, 182, 212, 0.12)" stroke="#06b6d4" stroke-width="2"/>
      <rect x="16" y="16" width="28" height="20" rx="4" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
      <circle cx="30" cy="26" r="4" fill="#38bdf8"/>
      <rect x="20" y="40" width="20" height="8" rx="4" fill="#334155" stroke="#22d3ee" stroke-width="1.5"/>
      <circle cx="24" cy="44" r="1.5" fill="#f43f5e"/>
      <circle cx="36" cy="44" r="1.5" fill="#34d399"/>
    </svg>
  `;

  SPRITES.FURNITURE_DISCO = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(236, 72, 153, 0.12)" stroke="#ec4899" stroke-width="2"/>
      <line x1="30" y1="5" x2="30" y2="18" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="30" cy="32" r="14" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
      <g stroke="#94a3b8" stroke-width="1">
        <line x1="16" y1="32" x2="44" y2="32"/>
        <line x1="30" y1="18" x2="30" y2="46"/>
        <line x1="20" y1="23" x2="40" y2="41"/>
        <line x1="20" y1="41" x2="40" y2="23"/>
      </g>
    </svg>
  `;

  SPRITES.FURNITURE_BUFFET = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(34, 197, 94, 0.12)" stroke="#22c55e" stroke-width="2"/>
      <ellipse cx="30" cy="30" rx="18" ry="6" fill="#38bdf8"/>
      <path d="M12 30 C12 44, 48 44, 48 30 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
      <circle cx="24" cy="29" r="2.5" fill="#f59e0b"/>
      <circle cx="30" cy="28" r="3" fill="#ef4444"/>
      <circle cx="36" cy="29" r="2.5" fill="#10b981"/>
    </svg>
  `;

  SPRITES.CLAN_SHIELD = (size = 48) => `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="50" height="50" rx="14" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" stroke-width="2"/>
      <path d="M16 16 C26 14, 34 14, 44 16 L44 32 C44 42, 34 48, 30 50 C26 48, 16 42, 16 32 Z" fill="#b45309" stroke="#fde047" stroke-width="2"/>
      <polygon points="30,22 36,34 24,34" fill="#fde047"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 7. ROCK PAPER SCISSORS SPRITES
  // -------------------------------------------------------------------------
  SPRITES.RPS_ROCK = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="rgba(14, 165, 233, 0.15)" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="12,24 16,14 26,12 32,18 30,28 18,30" fill="#64748b" stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="18,18 24,16 28,22 22,24" fill="#94a3b8"/>
    </svg>
  `;

  SPRITES.RPS_PAPER = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="rgba(52, 211, 153, 0.15)" stroke="#34d399" stroke-width="1.5"/>
      <rect x="12" y="10" width="16" height="20" rx="2" fill="#f8fafc" stroke="#34d399" stroke-width="2"/>
      <line x1="16" y1="16" x2="24" y2="16" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="16" y1="20" x2="24" y2="20" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="16" y1="24" x2="22" y2="24" stroke="#94a3b8" stroke-width="1.5"/>
    </svg>
  `;

  SPRITES.RPS_SCISSORS = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" stroke-width="1.5"/>
      <circle cx="14" cy="28" r="4" stroke="#f43f5e" stroke-width="2" fill="none"/>
      <circle cx="26" cy="28" r="4" stroke="#f43f5e" stroke-width="2" fill="none"/>
      <line x1="16" y1="26" x2="28" y2="10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="24" y1="26" x2="12" y2="10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="20" cy="20" r="2" fill="#fbbf24"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // 8. CHESS VECTOR PIECES
  // -------------------------------------------------------------------------
  SPRITES.CHESS_PIECES = {
    wK: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"/><circle cx="20" cy="18" r="1.5"/><circle cx="25" cy="18" r="1.5"/></g></svg>`,
    wQ: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-13-6 13-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 1-3.5 1-2 2-2 2-4-7-1.5-19.5-1.5-27 0z"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g></svg>`,
    wR: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5v-13h17v13H14zm-3-13l3-4h18l3 4H11zm0-4v-5h4v3h4v-3h7v3h4v-3h4v5H11z"/></g></svg>`,
    wB: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/><path d="M17.5 26h10M15 30h15"/></g></svg>`,
    wN: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.66 1.41-2 1-1-.41-.57-1.74-.5-2 .57-.68 1.42-.76 2-1 1-1 3-2 3-4-1-2.5-1.5-5.5-1.5-7.5 0-4 4-7.5 7.5-7.5 2 0 4.5 1 6 2.5"/><circle cx="21" cy="14" r="1.5"/></g></svg>`,
    wP: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#ffffff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,
    
    bK: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"/><circle cx="20" cy="18" r="1.5" fill="#f8fafc"/><circle cx="25" cy="18" r="1.5" fill="#f8fafc"/></g></svg>`,
    bQ: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-13-6 13-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 1-3.5 1-2 2-2 2-4-7-1.5-19.5-1.5-27 0z"/><circle cx="6" cy="12" r="2" fill="#f8fafc"/><circle cx="14" cy="9" r="2" fill="#f8fafc"/><circle cx="22.5" cy="8" r="2" fill="#f8fafc"/><circle cx="31" cy="9" r="2" fill="#f8fafc"/><circle cx="39" cy="12" r="2" fill="#f8fafc"/></g></svg>`,
    bR: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5v-13h17v13H14zm-3-13l3-4h18l3 4H11zm0-4v-5h4v3h4v-3h7v3h4v-3h4v5H11z"/></g></svg>`,
    bB: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5" fill="#f8fafc"/><path d="M17.5 26h10M15 30h15" stroke="#f8fafc"/></g></svg>`,
    bN: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.66 1.41-2 1-1-.41-.57-1.74-.5-2 .57-.68 1.42-.76 2-1 1-1 3-2 3-4-1-2.5-1.5-5.5-1.5-7.5 0-4 4-7.5 7.5-7.5 2 0 4.5 1 6 2.5"/><circle cx="21" cy="14" r="1.5" fill="#f8fafc"/></g></svg>`,
    bP: `<svg viewBox="0 0 45 45" width="42" height="42"><g fill="#334155" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`
  };

  // -------------------------------------------------------------------------
  // 9. GENERAL UI SPRITES
  // -------------------------------------------------------------------------
  SPRITES.UI_REFRESH = (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  `;

  SPRITES.UI_BOOK = (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  `;

  SPRITES.UI_TEMPLE = (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polygon points="12 2 2 7 22 7"/>
      <line x1="5" y1="7" x2="5" y2="18"/>
      <line x1="10" y1="7" x2="10" y2="18"/>
      <line x1="14" y1="7" x2="14" y2="18"/>
      <line x1="19" y1="7" x2="19" y2="18"/>
      <rect x="2" y="18" width="20" height="4" rx="1"/>
    </svg>
  `;

  SPRITES.UI_QUILL = (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
      <line x1="16" y1="8" x2="2" y2="22"/>
      <line x1="17.5" y1="15" x2="9" y2="15"/>
    </svg>
  `;

  SPRITES.UI_PAW = (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
      <ellipse cx="20" cy="27" rx="10" ry="7" fill="#c084fc"/>
      <circle cx="11" cy="17" r="4.5" fill="#c084fc"/>
      <circle cx="20" cy="13" r="4.5" fill="#c084fc"/>
      <circle cx="29" cy="17" r="4.5" fill="#c084fc"/>
    </svg>
  `;

  // -------------------------------------------------------------------------
  // CANVAS IMAGE CACHE SYSTEM
  // Converts SVG strings to HTMLImageElements for high-speed canvas drawing!
  // -------------------------------------------------------------------------
  const imageCache = {};

  function getCanvasSpriteImage(spriteKey, size = 60) {
    const cacheKey = `${spriteKey}_${size}`;
    if (imageCache[cacheKey]) return imageCache[cacheKey];

    const svgFn = SPRITES[spriteKey];
    if (!svgFn) return null;

    const svgString = svgFn(size);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    imageCache[cacheKey] = img;
    return img;
  }

  function drawSprite(ctx, spriteKey, x, y, size = 40) {
    const img = getCanvasSpriteImage(spriteKey, size);
    if (!img) return false;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      return true;
    }
    return false;
  }

  // Preload keys for instantaneous canvas rendering
  const PRELOAD_KEYS = [
    'HERO_BLADEDANCER', 'HERO_DEMONHUNTER', 'HERO_HARLEQUIN', 'HERO_DRYAD',
    'HERO_SCRAPPER', 'HERO_BARD', 'HERO_VAMPIRE', 'HERO_CULTIST',
    'HERO_RIDINGHOOD', 'HERO_MERMAID', 'HERO_RANGER', 'HERO_PYRO',
    'HERO_TEMPEST', 'HERO_VENOM', 'HERO_FROST', 'HERO_GUARDIAN',
    'HERO_SIPHON', 'HERO_ASSASSIN',
    'BOSS_GORGON', 'BOSS_BEDLAM', 'BOSS_WARLOCK', 'BOSS_TRIBUNAL', 'BOSS_PUPPETEER',
    'RANK_STAR', 'DRAGON_COIN', 'AETHER_CRYSTAL', 'SANCTUARY_HEART'
  ];

  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      PRELOAD_KEYS.forEach(key => getCanvasSpriteImage(key, 60));
    });
  }

  // EXPORT TO GLOBAL SCOPE
  global.DragonSprites = {
    SPRITES,
    getCanvasSpriteImage,
    drawSprite,
    renderSVG: (spriteKey, size) => {
      const fn = SPRITES[spriteKey];
      return fn ? fn(size) : '';
    }
  };

})(typeof window !== 'undefined' ? window : this);

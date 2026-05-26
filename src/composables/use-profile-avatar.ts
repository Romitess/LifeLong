import { ref, computed, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';

export interface AvatarOption {
  label: string;
  value: string;
  swatch?: string;
}

export interface CartoonAvatarConfig {
  body: string;
  face: string;
  eyeColor: string;
  hair: string;
  hairColor: string;
  shirt: string;
  shirtColor: string;
  pants: string;
  pantsColor: string;
  shoes: string;
  accessoryColor: string;
}

export const FULL_AVATAR_STORAGE_KEY = 'lll-profile-avatar-full';
export const CARTOON_AVATAR_STORAGE_KEY = 'lll-cartoon-avatar-config';

export const DEFAULT_CARTOON_AVATAR: CartoonAvatarConfig = {
  body: 'warm-sun',
  face: 'bright',
  eyeColor: 'amber',
  hair: 'soft-bob',
  hairColor: 'Midnight Navy',
  shirt: 'classic-tee',
  shirtColor: 'Midnight Navy',
  pants: 'soft-pants',
  pantsColor: 'Midnight Navy',
  shoes: 'clean',
  accessoryColor: 'violet',
};

export const DEFAULT_AVATAR_EXTRAS = {
  eyeColor: 'amber',
  accessoryColor: 'violet',
} satisfies Pick<CartoonAvatarConfig, 'eyeColor' | 'accessoryColor'>;

export function useProfileAvatar() {
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();

  const activeAvatarTab = ref('skin');
  const fullAvatarUrl = ref(getStoredFullAvatar());

  const animeBodyOptions: AvatarOption[] = [
    { label: 'Warm Sun', value: 'warm-sun' },
    { label: 'Honey Glow', value: 'honey-glow' },
    { label: 'Soft Cocoa', value: 'soft-cocoa' },
  ];
  const animeFaceOptions: AvatarOption[] = [
    { label: 'Bright', value: 'bright' },
    { label: 'Soft Smile', value: 'soft-smile' },
    { label: 'Focused', value: 'focused' },
  ];
  const animeHairOptions: AvatarOption[] = [
    { label: 'Soft Bob', value: 'soft-bob' },
    { label: 'Side Sweep', value: 'side-sweep' },
    { label: 'Gentle Wave', value: 'gentle-wave' },
  ];
  const animeColorOptions: AvatarOption[] = [
    { label: 'Midnight Navy', value: 'Midnight Navy' },
    { label: 'Chestnut Brown', value: 'Chestnut Brown' },
    { label: 'Golden Honey', value: 'Golden Honey' },
    { label: 'Sakura Rose', value: 'Sakura Rose' },
  ];
  const animeShirtOptions: AvatarOption[] = [
    { label: 'Classic Tee', value: 'classic-tee' },
    { label: 'Cardigan', value: 'cardigan' },
    { label: 'Hoodie', value: 'hoodie' },
  ];
  const animePantsOptions: AvatarOption[] = [
    { label: 'Soft Pants', value: 'soft-pants' },
    { label: 'Slim', value: 'slim' },
    { label: 'Comfort', value: 'comfort' },
  ];
  const animeShoesOptions: AvatarOption[] = [
    { label: 'Clean', value: 'clean' },
    { label: 'Sneakers', value: 'sneakers' },
    { label: 'Boots', value: 'boots' },
  ];

  const skinToneOptions: AvatarOption[] = [
    { label: 'Warm Sun', value: animeBodyOptions[0]?.value ?? '', swatch: '#df8e6e' },
    { label: 'Honey Glow', value: animeBodyOptions[1]?.value ?? '', swatch: '#c7865b' },
    { label: 'Soft Cocoa', value: animeBodyOptions[2]?.value ?? '', swatch: '#a86f4f' },
    { label: 'Peach Bloom', value: 'peach', swatch: '#e1936f' },
    { label: 'Golden Tan', value: 'golden', swatch: '#b97442' },
    { label: 'Rose Porcelain', value: 'porcelain', swatch: '#f2c2b1' },
  ];

  const eyeColorOptions: AvatarOption[] = [
    { label: 'Charcoal', value: 'charcoal', swatch: '#3f3f46' },
    { label: 'Amber', value: 'amber', swatch: '#f59e0b' },
    { label: 'Ocean', value: 'ocean', swatch: '#1d88d9' },
    { label: 'Teal', value: 'teal', swatch: '#1197a0' },
    { label: 'Leaf', value: 'leaf', swatch: '#65a30d' },
    { label: 'Berry', value: 'berry', swatch: '#d946ef' },
    { label: 'Cherry', value: 'cherry', swatch: '#ff3b3b' },
    { label: 'Lavender', value: 'lavender', swatch: '#8b5cf6' },
    { label: 'Sunbeam', value: 'sunbeam', swatch: '#f7b500' },
  ];

  const eyeOptions: AvatarOption[] = [
    { label: 'Bright', value: animeFaceOptions[0]?.value ?? '' },
    { label: 'Calm', value: animeFaceOptions[1]?.value ?? '' },
    { label: 'Focused', value: animeFaceOptions[2]?.value ?? '' },
    { label: 'Joyful', value: 'joyful' },
    { label: 'Sleepy', value: 'sleepy' },
    { label: 'Wink', value: 'wink' },
  ];

  const hairStyleOptions: AvatarOption[] = [
    { label: 'Cloud Bob', value: animeHairOptions[0]?.value ?? '' },
    { label: 'Side Sweep', value: animeHairOptions[1]?.value ?? '' },
    { label: 'Soft Wave', value: animeHairOptions[2]?.value ?? '' },
    { label: 'Puff Cut', value: 'puff' },
    { label: 'Rounded Bob', value: 'rounded' },
    { label: 'Curly Pop', value: 'curly' },
  ];

  const hairColorOptions: AvatarOption[] = [
    { label: 'Ink Blue', value: animeColorOptions[0]?.value ?? '', swatch: '#2d355f' },
    { label: 'Chestnut', value: animeColorOptions[1]?.value ?? '', swatch: '#6f4a3c' },
    { label: 'Honey Gold', value: animeColorOptions[2]?.value ?? '', swatch: '#bd9246' },
    { label: 'Coral Rose', value: animeColorOptions[3]?.value ?? '', swatch: '#c3618c' },
    { label: 'Graphite', value: 'graphite', swatch: '#44474f' },
    { label: 'Sand', value: 'sand', swatch: '#d3b17c' },
    { label: 'Mint', value: 'mint', swatch: '#34d399' },
    { label: 'Plum', value: 'plum', swatch: '#7c3aed' },
  ];

  const topStyleOptions: AvatarOption[] = [
    { label: 'Classic Tee', value: animeShirtOptions[0]?.value ?? '' },
    { label: 'Apron Vest', value: animeShirtOptions[1]?.value ?? '' },
    { label: 'Cape Hoodie', value: animeShirtOptions[2]?.value ?? '' },
    { label: 'Collar Pop', value: 'collar' },
    { label: 'Cozy Knit', value: 'knit' },
  ];

  const topColorOptions: AvatarOption[] = [
    { label: 'Violet', value: 'violet', swatch: '#a777bc' },
    { label: 'Ocean', value: 'ocean-top', swatch: '#4e8fd2' },
    { label: 'Leaf', value: 'leaf-top', swatch: '#78b860' },
    { label: 'Sunset', value: 'sunset', swatch: '#f2a55f' },
    { label: 'Cherry', value: 'cherry-top', swatch: '#e2627f' },
    { label: 'Slate', value: 'slate', swatch: '#5f6f8d' },
    { label: 'Rose', value: 'rose-top', swatch: '#de7ca4' },
    { label: 'Gold', value: 'gold-top', swatch: '#e0b64d' },
  ];

  const bodyStyleOptions: AvatarOption[] = [
    { label: 'Soft Shape', value: animePantsOptions[0]?.value ?? '' },
    { label: 'Square Shape', value: animePantsOptions[1]?.value ?? '' },
    { label: 'Hero Shape', value: animePantsOptions[2]?.value ?? '' },
    { label: 'Tall Frame', value: 'tall' },
    { label: 'Relaxed Fit', value: 'relaxed' },
    { label: 'Wide Frame', value: 'wide' },
  ];

  const backdropOptions: AvatarOption[] = [
    { label: 'Sky Studio', value: animeColorOptions[0]?.value ?? '', swatch: '#d8e4f6' },
    { label: 'Sunrise Room', value: animeColorOptions[1]?.value ?? '', swatch: '#f5ddd0' },
    { label: 'Mint Stage', value: animeColorOptions[2]?.value ?? '', swatch: '#d9edd8' },
    { label: 'Lilac Loft', value: animeColorOptions[3]?.value ?? '', swatch: '#efe0f1' },
    { label: 'Peach Glow', value: 'peach-bg', swatch: '#fce6d9' },
    { label: 'Soft Gray', value: 'studio-bg', swatch: '#e9ecf1' },
  ];

  const accessoryColorOptions: AvatarOption[] = [
    { label: 'Violet', value: 'violet', swatch: '#8b63d2' },
    { label: 'Blue', value: 'blue', swatch: '#1d88d9' },
    { label: 'Leaf', value: 'leaf', swatch: '#65a30d' },
    { label: 'Orange', value: 'orange', swatch: '#fb8c00' },
    { label: 'Pink', value: 'pink', swatch: '#ff4d6d' },
    { label: 'Smoke', value: 'smoke', swatch: '#52525b' },
    { label: 'Cream', value: 'cream', swatch: '#e8d2bf' },
  ];

  const accessoryOptions: AvatarOption[] = [
    { label: 'Clean', value: animeShoesOptions[0]?.value ?? '' },
    { label: 'Glasses', value: animeShoesOptions[1]?.value ?? '' },
    { label: 'Beanie', value: animeShoesOptions[2]?.value ?? '' },
    { label: 'Round Glasses', value: 'round-glasses' },
    { label: 'Sunglasses', value: 'sunglasses' },
    { label: 'Earrings', value: 'earrings' },
  ];

  const cartoonAvatar = reactive<CartoonAvatarConfig>({
    body: 'warm-sun',
    face: 'bright',
    hair: 'soft-bob',
    hairColor: 'Midnight Navy',
    shirt: 'classic-tee',
    shirtColor: 'Midnight Navy',
    pants: 'soft-pants',
    pantsColor: 'Midnight Navy',
    shoes: 'clean',
    ...DEFAULT_AVATAR_EXTRAS,
  });

  const storedCartoonAvatar = getStoredCartoonAvatar();
  Object.assign(cartoonAvatar, DEFAULT_CARTOON_AVATAR, DEFAULT_AVATAR_EXTRAS, storedCartoonAvatar);

  const selectedSkinLabel = computed<string>(() =>
    getAvatarOptionLabel(skinToneOptions, cartoonAvatar.body),
  );
  const selectedEyeColorLabel = computed<string>(() =>
    getAvatarOptionLabel(eyeColorOptions, cartoonAvatar.eyeColor),
  );
  const selectedEyesLabel = computed<string>(() =>
    getAvatarOptionLabel(eyeOptions, cartoonAvatar.face),
  );
  const selectedHairLabel = computed<string>(() =>
    getAvatarOptionLabel(hairStyleOptions, cartoonAvatar.hair),
  );
  const selectedHairColorLabel = computed<string>(() =>
    getAvatarOptionLabel(hairColorOptions, cartoonAvatar.hairColor),
  );
  const selectedTopLabel = computed<string>(() =>
    getAvatarOptionLabel(topStyleOptions, cartoonAvatar.shirt),
  );
  const selectedTopColorLabel = computed<string>(() =>
    getAvatarOptionLabel(topColorOptions, cartoonAvatar.shirtColor),
  );
  const selectedBodyLabel = computed<string>(() =>
    getAvatarOptionLabel(bodyStyleOptions, cartoonAvatar.pants),
  );
  const selectedBackdropLabel = computed<string>(() =>
    getAvatarOptionLabel(backdropOptions, cartoonAvatar.pantsColor),
  );
  const selectedAccessoryColorLabel = computed<string>(() =>
    getAvatarOptionLabel(accessoryColorOptions, cartoonAvatar.accessoryColor),
  );
  const selectedAccessoryLabel = computed<string>(() =>
    getAvatarOptionLabel(accessoryOptions, cartoonAvatar.shoes),
  );

  const avatarPreviewUrl = computed<string>(() =>
    createPlayfulAvatarDataUrl(cartoonAvatar, 'stage', true),
  );
  const avatarPortraitUrl = computed<string>(() =>
    createPlayfulAvatarDataUrl(cartoonAvatar, 'portrait'),
  );

  function getAvatarOptionLabel(options: AvatarOption[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? value;
  }

  function getEyeGlyphStyle(value: string): string {
    if (value === animeFaceOptions[1]?.value) return 'calm';
    if (value === animeFaceOptions[2]?.value) return 'focused';
    return 'bright';
  }

  function getHairGlyphStyle(value: string): string {
    if (value === animeHairOptions[1]?.value) return 'sweep';
    if (value === animeHairOptions[2]?.value) return 'wave';
    return 'cloud';
  }

  function getTopGlyphStyle(value: string): string {
    if (value === animeShirtOptions[1]?.value) return 'apron';
    if (value === animeShirtOptions[2]?.value) return 'cape';
    return 'classic';
  }

  function getBodyGlyphStyle(value: string): string {
    if (value === animePantsOptions[1]?.value) return 'square';
    if (value === animePantsOptions[2]?.value) return 'hero';
    return 'soft';
  }

  function getAccessoryGlyphStyle(value: string): string {
    if (value === 'round-glasses') return 'round-glasses';
    if (value === 'sunglasses') return 'sunglasses';
    if (value === 'earrings') return 'earrings';
    if (value === animeShoesOptions[1]?.value) return 'glasses';
    if (value === animeShoesOptions[2]?.value) return 'beanie';
    return 'clean';
  }

  function createAvatarOptionPreview(overrides: Partial<CartoonAvatarConfig>): string {
    return createPlayfulAvatarDataUrl(
      {
        ...cartoonAvatar,
        ...overrides,
      },
      'portrait',
      false,
    );
  }

  function pickRandomAvatarOption(options: AvatarOption[]): string {
    return options[Math.floor(Math.random() * options.length)]?.value ?? '';
  }

  function randomizeCartoonAvatar(): void {
    cartoonAvatar.body = pickRandomAvatarOption(skinToneOptions);
    cartoonAvatar.face = pickRandomAvatarOption(eyeOptions);
    cartoonAvatar.eyeColor = pickRandomAvatarOption(eyeColorOptions);
    cartoonAvatar.hair = pickRandomAvatarOption(hairStyleOptions);
    cartoonAvatar.hairColor = pickRandomAvatarOption(hairColorOptions);
    cartoonAvatar.shirt = pickRandomAvatarOption(topStyleOptions);
    cartoonAvatar.shirtColor = pickRandomAvatarOption(topColorOptions);
    cartoonAvatar.pants = pickRandomAvatarOption(bodyStyleOptions);
    cartoonAvatar.pantsColor = pickRandomAvatarOption(backdropOptions);
    cartoonAvatar.shoes = pickRandomAvatarOption(accessoryOptions);
    cartoonAvatar.accessoryColor = pickRandomAvatarOption(accessoryColorOptions);
  }

  function saveCartoonAvatar(): void {
    const snapshot: CartoonAvatarConfig = {
      body: cartoonAvatar.body,
      face: cartoonAvatar.face,
      eyeColor: cartoonAvatar.eyeColor,
      hair: cartoonAvatar.hair,
      hairColor: cartoonAvatar.hairColor,
      shirt: cartoonAvatar.shirt,
      shirtColor: cartoonAvatar.shirtColor,
      pants: cartoonAvatar.pants,
      pantsColor: cartoonAvatar.pantsColor,
      shoes: cartoonAvatar.shoes,
      accessoryColor: cartoonAvatar.accessoryColor,
    };

    persistCartoonAvatar(snapshot);
    authStore.setAvatar(avatarPortraitUrl.value);
    fullAvatarUrl.value = avatarPreviewUrl.value;

    $q.notify({
      type: 'positive',
      message: t('profile.notifications.avatarSaved'),
      position: 'top',
    });
  }

  function createPlayfulAvatarDataUrl(
    config: CartoonAvatarConfig,
    mode: 'stage' | 'portrait',
    animate = false,
  ): string {
    const svg = createPlayfulAvatarSvg(config, mode, animate);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createPlayfulAvatarSvg(
    config: CartoonAvatarConfig,
    mode: 'stage' | 'portrait',
    animate = false,
  ): string {
    const skinMap: Record<string, string> = {
      [animeBodyOptions[0]?.value ?? '']: '#df8e6e',
      [animeBodyOptions[1]?.value ?? '']: '#c7865b',
      [animeBodyOptions[2]?.value ?? '']: '#a86f4f',
      peach: '#e1936f',
      golden: '#b97442',
      porcelain: '#f2c2b1',
    };
    const colorMap: Record<string, string> = {
      [animeColorOptions[0]?.value ?? '']: '#5f6f8d',
      [animeColorOptions[1]?.value ?? '']: '#d88962',
      [animeColorOptions[2]?.value ?? '']: '#88b173',
      [animeColorOptions[3]?.value ?? '']: '#a777bc',
      graphite: '#44474f',
      sand: '#d3b17c',
      mint: '#34d399',
      plum: '#7c3aed',
      violet: '#a777bc',
      'ocean-top': '#4e8fd2',
      'leaf-top': '#78b860',
      sunset: '#f2a55f',
      'cherry-top': '#e2627f',
      slate: '#5f6f8d',
      'rose-top': '#de7ca4',
      'gold-top': '#e0b64d',
      blue: '#1d88d9',
      leaf: '#65a30d',
      orange: '#fb8c00',
      pink: '#ff4d6d',
      smoke: '#52525b',
      cream: '#e8d2bf',
    };
    const eyeColorMap: Record<string, string> = {
      charcoal: '#3f3f46',
      amber: '#f59e0b',
      ocean: '#1d88d9',
      teal: '#1197a0',
      leaf: '#65a30d',
      berry: '#d946ef',
      cherry: '#ff3b3b',
      lavender: '#8b5cf6',
      sunbeam: '#f7b500',
    };
    const backgroundMap: Record<string, { top: string; bottom: string; panel: string }> = {
      [animeColorOptions[0]?.value ?? '']: { top: '#eff5fb', bottom: '#d7e8f8', panel: '#e5f0fa' },
      [animeColorOptions[1]?.value ?? '']: { top: '#fff4eb', bottom: '#f6dfd0', panel: '#fbeadc' },
      [animeColorOptions[2]?.value ?? '']: { top: '#f1fbf1', bottom: '#d7edd8', panel: '#e5f6e6' },
      [animeColorOptions[3]?.value ?? '']: { top: '#faf3ff', bottom: '#eadcf6', panel: '#f1e6fa' },
      'peach-bg': { top: '#fff4ed', bottom: '#fce6d9', panel: '#fff0e6' },
      'studio-bg': { top: '#f6f7fa', bottom: '#e8ecf2', panel: '#eef1f6' },
    };

    const skin = skinMap[config.body] ?? '#df8e6e';
    const hair = colorMap[config.hairColor] ?? '#5f6f8d';
    const topColor = colorMap[config.shirtColor] ?? '#a777bc';
    const accessoryColor = colorMap[config.accessoryColor] ?? '#8b63d2';
    const eyeColor = eyeColorMap[config.eyeColor] ?? '#f59e0b';
    const scene = backgroundMap[config.pantsColor] ??
      backgroundMap[animeColorOptions[0]?.value ?? ''] ?? {
        top: '#eff5fb',
        bottom: '#d7e8f8',
        panel: '#e5f0fa',
      };
    const outline = '#414141';
    const blush = withOpacity('#f08ba2', 0.35);
    const portraitScale = mode === 'portrait' ? 1.08 : 1;
    const bodyVariant = getBodyVariant(config.pants);
    const shirtVariant = getTopVariant(config.shirt);
    const hairShape = getPlayfulHair(config.hair);
    const face = getPlayfulFace(config.face, eyeColor, outline, blush, skin, animate);
    const accessory = getAccessory(config.shoes, outline, accessoryColor);
    const bodyTopY = mode === 'portrait' ? 316 : 328;
    const bodyBottomY = mode === 'portrait' ? 528 : 546;
    const armTopY = bodyTopY + 22;
    const armMidY = mode === 'portrait' ? 448 : 462;
    const armEndY = mode === 'portrait' ? 522 : 538;
    const idleMotion = animate
      ? `
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0; 0 0; 0 0"
        dur="4.8s"
        repeatCount="indefinite"
      />`
      : '';

    return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" role="img" aria-label="Playful avatar">
    <defs>
      <linearGradient id="avatar-bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${scene.top}" />
        <stop offset="100%" stop-color="${scene.bottom}" />
      </linearGradient>
    </defs>
    <rect width="560" height="560" rx="42" fill="url(#avatar-bg)" />
    <rect x="${mode === 'portrait' ? 58 : 44}" y="${mode === 'portrait' ? 62 : 42}" width="${mode === 'portrait' ? 444 : 472}" height="${mode === 'portrait' ? 444 : 476}" rx="28" fill="${scene.panel}" />
    <circle cx="280" cy="${mode === 'portrait' ? 180 : 148}" r="${mode === 'portrait' ? 104 : 92}" fill="${withOpacity('#ffffff', 0.5)}" />
    <g transform="translate(280 288) scale(${portraitScale}) translate(-280 -288)">
      ${idleMotion}
      <path d="${hairShape.back}" fill="${hair}" />
      <path d="M194 ${armTopY} C170 ${armTopY + 36} 156 ${armMidY - 20} 164 ${armEndY}" stroke="${withOpacity(outline, 0.18)}" stroke-width="50" stroke-linecap="round" fill="none" />
      <path d="M366 ${armTopY} C390 ${armTopY + 36} 404 ${armMidY - 20} 396 ${armEndY}" stroke="${withOpacity(outline, 0.18)}" stroke-width="50" stroke-linecap="round" fill="none" />
      <path d="M194 ${armTopY} C170 ${armTopY + 36} 156 ${armMidY - 20} 164 ${armEndY}" stroke="${topColor}" stroke-width="40" stroke-linecap="round" fill="none" />
      <path d="M366 ${armTopY} C390 ${armTopY + 36} 404 ${armMidY - 20} 396 ${armEndY}" stroke="${topColor}" stroke-width="40" stroke-linecap="round" fill="none" />
      <circle cx="165" cy="${armEndY + 10}" r="12" fill="${skin}" />
      <circle cx="395" cy="${armEndY + 10}" r="12" fill="${skin}" />
      <path d="M168 364 C188 322 216 298 280 298 C344 298 372 322 392 364 L${bodyVariant.shoulderRight} ${bodyBottomY} H${bodyVariant.shoulderLeft} Z" fill="${topColor}" />
      ${shirtVariant}
      <rect x="248" y="${bodyTopY - 20}" width="64" height="42" rx="18" fill="${skin}" />
      <rect x="162" y="132" width="236" height="226" rx="58" fill="${skin}" />
      <rect x="118" y="216" width="42" height="38" rx="19" fill="${skin}" />
      <rect x="400" y="216" width="42" height="38" rx="19" fill="${skin}" />
      <path d="${hairShape.front}" fill="${hair}" />
      ${face}
      <path d="M278 233 C286 244 292 250 296 262 C298 272 288 282 278 282 C266 282 258 272 260 262 C264 249 272 243 278 233 Z" fill="#a85d39" />
      ${accessory}
    </g>
  </svg>`.trim();
  }

  function getPlayfulFace(
    faceStyle: string,
    eyeColor: string,
    outline: string,
    blush: string,
    skin: string,
    animate: boolean,
  ): string {
    const blink = animate ? createBlinkOverlay(skin) : '';

    if (faceStyle === 'joyful') {
      return `
        <ellipse cx="228" cy="218" rx="42" ry="50" fill="#ffffff" />
        <ellipse cx="332" cy="218" rx="42" ry="50" fill="#ffffff" />
        <circle cx="228" cy="220" r="30" fill="${outline}" />
        <circle cx="332" cy="220" r="30" fill="${outline}" />
        <circle cx="228" cy="228" r="15" fill="${eyeColor}" />
        <circle cx="332" cy="228" r="15" fill="${eyeColor}" />
        <path d="M214 206 L222 216 L214 224 L226 220 L236 230 L232 216 L244 208 L230 208 L226 194 L222 208 Z" fill="#ffffff" />
        <path d="M318 206 L326 216 L318 224 L330 220 L340 230 L336 216 L348 208 L334 208 L330 194 L326 208 Z" fill="#ffffff" />
        <path d="M236 314 C252 294 286 294 306 314 C312 322 312 340 300 348 C288 356 272 350 262 338 L254 332 C246 326 238 322 236 314 Z" fill="#af2f42" />
        <path d="M258 320 C266 312 278 310 292 314 C282 322 272 328 262 336 Z" fill="#ffb2b2" />
        <path d="M244 188 Q262 176 282 188" stroke="#94553c" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M292 188 Q312 176 330 188" stroke="#94553c" stroke-width="5" stroke-linecap="round" fill="none" />
        <ellipse cx="206" cy="286" rx="18" ry="10" fill="${blush}" />
        <ellipse cx="354" cy="286" rx="18" ry="10" fill="${blush}" />
        ${blink}
      `;
    }

    if (faceStyle === 'sleepy') {
      return `
        <ellipse cx="230" cy="218" rx="34" ry="24" fill="#ffffff" />
        <ellipse cx="330" cy="218" rx="34" ry="24" fill="#ffffff" />
        <path d="M198 214 Q230 202 262 214" stroke="${outline}" stroke-width="8" stroke-linecap="round" fill="none" />
        <path d="M298 214 Q330 202 362 214" stroke="${outline}" stroke-width="8" stroke-linecap="round" fill="none" />
        <circle cx="230" cy="222" r="11" fill="${eyeColor}" />
        <circle cx="330" cy="222" r="11" fill="${eyeColor}" />
        <circle cx="226" cy="218" r="4" fill="#ffffff" />
        <circle cx="326" cy="218" r="4" fill="#ffffff" />
        <path d="M210 192 Q230 186 248 192" stroke="#94553c" stroke-width="4" stroke-linecap="round" fill="none" />
        <path d="M312 192 Q330 186 350 192" stroke="#94553c" stroke-width="4" stroke-linecap="round" fill="none" />
        <path d="M248 312 Q280 320 312 312" stroke="#a55531" stroke-width="10" stroke-linecap="round" fill="none" />
        <ellipse cx="212" cy="286" rx="18" ry="10" fill="${blush}" />
        <ellipse cx="348" cy="286" rx="18" ry="10" fill="${blush}" />
        ${blink}
      `;
    }

    if (faceStyle === 'wink') {
      return `
        <path d="M194 220 Q228 206 258 220" stroke="${outline}" stroke-width="10" stroke-linecap="round" fill="none" />
        <ellipse cx="330" cy="218" rx="34" ry="42" fill="#ffffff" />
        <circle cx="330" cy="224" r="18" fill="${eyeColor}" />
        <circle cx="330" cy="224" r="10" fill="${outline}" />
        <circle cx="338" cy="214" r="6" fill="#ffffff" />
        <path d="M210 190 Q230 180 250 190" stroke="#94553c" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M308 190 Q330 176 350 190" stroke="#94553c" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M236 304 C256 326 290 326 320 300" stroke="#a55531" stroke-width="10" stroke-linecap="round" fill="none" />
        <ellipse cx="212" cy="286" rx="18" ry="10" fill="${blush}" />
        <ellipse cx="348" cy="286" rx="18" ry="10" fill="${blush}" />
        ${blink}
      `;
    }

    if (faceStyle === animeFaceOptions[1]?.value) {
      return `
        <ellipse cx="230" cy="216" rx="30" ry="40" fill="#ffffff" />
        <ellipse cx="330" cy="216" rx="30" ry="40" fill="#ffffff" />
        <ellipse cx="220" cy="228" rx="14" ry="18" fill="${eyeColor}" />
        <ellipse cx="320" cy="228" rx="14" ry="18" fill="${eyeColor}" />
        <ellipse cx="220" cy="228" rx="9" ry="12" fill="${outline}" />
        <ellipse cx="320" cy="228" rx="9" ry="12" fill="${outline}" />
        <circle cx="214" cy="214" r="6" fill="#ffffff" />
        <circle cx="314" cy="214" r="6" fill="#ffffff" />
        <path d="M220 300 C244 324 288 330 322 304" stroke="#a55531" stroke-width="10" stroke-linecap="round" fill="none" />
        <ellipse cx="212" cy="286" rx="20" ry="12" fill="${blush}" />
        <ellipse cx="348" cy="286" rx="20" ry="12" fill="${blush}" />
        ${blink}
      `;
    }

    if (faceStyle === animeFaceOptions[2]?.value) {
      return `
        <ellipse cx="230" cy="216" rx="30" ry="40" fill="#ffffff" />
        <ellipse cx="330" cy="216" rx="30" ry="40" fill="#ffffff" />
        <path d="M200 208 Q222 194 244 208" stroke="${outline}" stroke-width="8" stroke-linecap="round" fill="none" />
        <path d="M300 208 Q322 194 344 208" stroke="${outline}" stroke-width="8" stroke-linecap="round" fill="none" />
        <ellipse cx="220" cy="228" rx="13" ry="16" fill="${eyeColor}" />
        <ellipse cx="320" cy="228" rx="13" ry="16" fill="${eyeColor}" />
        <ellipse cx="220" cy="228" rx="8" ry="10" fill="${outline}" />
        <ellipse cx="320" cy="228" rx="8" ry="10" fill="${outline}" />
        <path d="M236 312 C260 296 298 294 322 310" stroke="#a55531" stroke-width="10" stroke-linecap="round" fill="none" />
        <ellipse cx="212" cy="286" rx="20" ry="12" fill="${blush}" />
        <ellipse cx="348" cy="286" rx="20" ry="12" fill="${blush}" />
        ${blink}
      `;
    }

    return `
      <ellipse cx="230" cy="216" rx="32" ry="42" fill="#ffffff" />
      <ellipse cx="330" cy="216" rx="32" ry="42" fill="#ffffff" />
      <circle cx="220" cy="226" r="16" fill="${eyeColor}" />
      <circle cx="320" cy="226" r="16" fill="${eyeColor}" />
      <path d="M214 198 C232 196 242 206 242 224 V242 C242 258 232 266 218 266 C204 266 194 258 194 242 V222 C194 208 200 200 214 198 Z" fill="${outline}" />
      <path d="M318 198 C336 196 346 206 346 224 V242 C346 258 336 266 322 266 C308 266 298 258 298 242 V222 C298 208 304 200 318 198 Z" fill="${outline}" />
      <circle cx="214" cy="212" r="8" fill="#ffffff" />
      <circle cx="318" cy="212" r="8" fill="#ffffff" />
      <path d="M214 302 C236 326 286 334 330 300" stroke="#a55531" stroke-width="10" stroke-linecap="round" fill="none" />
      <ellipse cx="212" cy="286" rx="20" ry="12" fill="${blush}" />
      <ellipse cx="348" cy="286" rx="20" ry="12" fill="${blush}" />
      ${blink}
    `;
  }

  function createBlinkOverlay(skin: string): string {
    return `
      <g>
        <rect x="190" y="172" width="76" height="0" rx="30" fill="${skin}">
          <animate attributeName="height" values="0;0;46;0;0" keyTimes="0;0.44;0.48;0.52;1" dur="4.8s" repeatCount="indefinite" />
        </rect>
        <rect x="294" y="172" width="76" height="0" rx="30" fill="${skin}">
          <animate attributeName="height" values="0;0;46;0;0" keyTimes="0;0.44;0.48;0.52;1" dur="4.8s" repeatCount="indefinite" />
        </rect>
      </g>
    `;
  }

  function getPlayfulHair(hairStyle: string): { back: string; front: string } {
    if (hairStyle === 'puff') {
      return {
        back: 'M154 170 C170 90 228 58 280 58 C332 58 390 90 406 170 V250 L372 242 L360 294 L324 250 L280 302 L236 250 L200 294 L188 242 L154 250 Z',
        front:
          'M164 170 C188 98 236 70 280 70 C324 70 372 98 396 170 C376 162 356 162 338 170 C324 176 310 182 292 182 H268 C248 182 234 176 220 170 C202 162 184 162 164 170 Z',
      };
    }

    if (hairStyle === 'rounded') {
      return {
        back: 'M160 164 C176 94 230 62 280 62 C330 62 384 94 400 164 V252 H160 Z',
        front:
          'M168 168 C194 106 238 82 280 82 C322 82 366 106 392 168 C370 156 348 154 328 162 C310 170 294 176 280 176 C266 176 250 170 232 162 C212 154 190 156 168 168 Z',
      };
    }

    if (hairStyle === 'curly') {
      return {
        back: 'M158 170 C170 96 228 60 280 60 C332 60 390 96 402 170 V252 L370 246 L364 284 L334 252 L280 300 L226 252 L196 284 L190 246 L158 252 Z',
        front:
          'M168 176 C182 146 206 126 224 118 C238 132 250 144 266 152 C282 140 296 126 314 114 C334 120 360 144 392 176 C360 166 334 168 316 182 C300 194 288 200 280 200 C270 200 258 194 242 182 C222 168 198 166 168 176 Z',
      };
    }

    if (hairStyle === animeHairOptions[1]?.value) {
      return {
        back: 'M156 174 C164 94 224 58 280 58 C336 58 390 94 402 170 V246 L368 236 L354 282 L330 240 L280 280 L230 240 L206 282 L192 236 L158 246 Z',
        front:
          'M166 180 C190 110 236 82 280 82 C324 82 362 110 388 178 C364 170 342 172 322 188 C308 200 292 206 280 206 C268 206 254 200 240 188 C220 172 196 170 166 180 Z',
      };
    }

    if (hairStyle === animeHairOptions[2]?.value) {
      return {
        back: 'M160 164 C178 92 228 60 280 60 C332 60 382 92 400 164 V248 L368 244 L360 292 L332 248 L280 300 L228 248 L200 292 L192 244 L160 248 Z',
        front:
          'M166 166 C194 98 238 74 280 74 C322 74 356 94 388 162 C352 138 324 138 298 156 C284 166 270 170 252 168 C226 166 198 162 166 166 Z',
      };
    }

    return {
      back: 'M166 166 C182 94 230 62 280 62 C330 62 378 94 394 166 V246 L366 240 L356 288 L324 246 L280 292 L236 246 L204 288 L194 240 L166 246 Z',
      front:
        'M170 170 C198 102 240 80 280 80 C320 80 356 102 390 168 C364 152 344 152 324 166 C308 178 294 184 280 184 C266 184 252 178 236 166 C218 152 198 152 170 170 Z',
    };
  }

  function getTopVariant(shirtStyle: string): string {
    if (shirtStyle === 'collar') {
      return `
        <path d="M222 346 L254 314 H306 L338 346 L318 370 L294 346 L280 366 L266 346 L242 370 Z" fill="#ffffff" />
        <path d="M258 344 L280 374 L302 344" fill="${withOpacity('#ffffff', 0.22)}" />
      `;
    }

    if (shirtStyle === 'knit') {
      return `
        <rect x="226" y="338" width="108" height="36" rx="18" fill="${withOpacity('#ffffff', 0.24)}" />
        <path d="M238 392 Q280 420 322 392" stroke="${withOpacity('#ffffff', 0.22)}" stroke-width="14" stroke-linecap="round" fill="none" />
        <path d="M236 430 Q280 448 324 430" stroke="${withOpacity('#ffffff', 0.18)}" stroke-width="10" stroke-linecap="round" fill="none" />
      `;
    }

    if (shirtStyle === animeShirtOptions[1]?.value) {
      return `
        <path d="M198 356 C218 324 244 308 280 308 C316 308 342 324 362 356" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none" />
        <rect x="244" y="350" width="72" height="116" rx="16" fill="${withOpacity('#ffffff', 0.22)}" />
        <rect x="266" y="350" width="16" height="116" rx="8" fill="${withOpacity('#ffffff', 0.34)}" />
        <rect x="298" y="350" width="16" height="116" rx="8" fill="${withOpacity('#ffffff', 0.34)}" />
      `;
    }

    if (shirtStyle === animeShirtOptions[2]?.value) {
      return `
        <path d="M202 358 C222 320 250 304 280 304 C310 304 338 320 358 358 L330 374 C316 350 300 340 280 340 C260 340 244 350 230 374 Z" fill="${withOpacity('#ffffff', 0.26)}" />
        <path d="M212 378 C236 402 258 414 280 414 C302 414 324 402 348 378" stroke="${withOpacity('#ffffff', 0.24)}" stroke-width="16" stroke-linecap="round" fill="none" />
      `;
    }

    return `
      <rect x="236" y="342" width="88" height="28" rx="14" fill="#ffffff" />
      <path d="M256 370 L280 392 L304 370" fill="${withOpacity('#ffffff', 0.28)}" />
    `;
  }

  function getBodyVariant(bodyStyle: string): { shoulderLeft: number; shoulderRight: number } {
    if (bodyStyle === 'tall') {
      return { shoulderLeft: 194, shoulderRight: 366 };
    }

    if (bodyStyle === 'relaxed') {
      return { shoulderLeft: 176, shoulderRight: 384 };
    }

    if (bodyStyle === 'wide') {
      return { shoulderLeft: 164, shoulderRight: 396 };
    }

    if (bodyStyle === animePantsOptions[1]?.value) {
      return { shoulderLeft: 188, shoulderRight: 372 };
    }

    if (bodyStyle === animePantsOptions[2]?.value) {
      return { shoulderLeft: 172, shoulderRight: 388 };
    }

    return { shoulderLeft: 180, shoulderRight: 380 };
  }

  function getAccessory(accessoryStyle: string, outline: string, accessoryColor: string): string {
    if (accessoryStyle === 'round-glasses') {
      return `
        <circle cx="214" cy="214" r="30" fill="none" stroke="${accessoryColor}" stroke-width="8" />
        <circle cx="346" cy="214" r="30" fill="none" stroke="${accessoryColor}" stroke-width="8" />
        <path d="M244 214 H316" stroke="${accessoryColor}" stroke-width="8" stroke-linecap="round" />
      `;
    }

    if (accessoryStyle === 'sunglasses') {
      return `
        <rect x="178" y="188" width="72" height="52" rx="24" fill="${withOpacity('#111827', 0.82)}" stroke="${accessoryColor}" stroke-width="8" />
        <rect x="310" y="188" width="72" height="52" rx="24" fill="${withOpacity('#111827', 0.82)}" stroke="${accessoryColor}" stroke-width="8" />
        <path d="M250 214 H310" stroke="${accessoryColor}" stroke-width="8" stroke-linecap="round" />
      `;
    }

    if (accessoryStyle === 'earrings') {
      return `
        <circle cx="132" cy="236" r="10" fill="${accessoryColor}" />
        <circle cx="428" cy="236" r="10" fill="${accessoryColor}" />
      `;
    }

    if (accessoryStyle === animeShoesOptions[1]?.value) {
      return `
        <rect x="178" y="188" width="72" height="56" rx="28" fill="none" stroke="${accessoryColor}" stroke-width="8" />
        <rect x="310" y="188" width="72" height="56" rx="28" fill="none" stroke="${accessoryColor}" stroke-width="8" />
        <path d="M250 214 H310" stroke="${accessoryColor}" stroke-width="8" stroke-linecap="round" />
      `;
    }

    if (accessoryStyle === animeShoesOptions[2]?.value) {
      return `
        <path d="M208 116 C226 88 252 74 280 74 C308 74 334 88 352 116 L344 146 H216 Z" fill="${accessoryColor}" />
        <rect x="214" y="138" width="132" height="20" rx="10" fill="#f3d8a2" />
      `;
    }

    return '';
  }

  function createAnimeAvatarDataUrl(
    config: CartoonAvatarConfig,
    mode: 'stage' | 'portrait',
  ): string {
    return createPlayfulAvatarDataUrl(config, mode);
  }

  function createAnimeAvatarSvg(config: CartoonAvatarConfig, mode: 'stage' | 'portrait'): string {
    return createPlayfulAvatarSvg(config, mode);
  }

  return {
    activeAvatarTab,
    fullAvatarUrl,
    cartoonAvatar,
    skinToneOptions,
    eyeColorOptions,
    eyeOptions,
    hairStyleOptions,
    hairColorOptions,
    topStyleOptions,
    topColorOptions,
    bodyStyleOptions,
    backdropOptions,
    accessoryColorOptions,
    accessoryOptions,
    selectedSkinLabel,
    selectedEyeColorLabel,
    selectedEyesLabel,
    selectedHairLabel,
    selectedHairColorLabel,
    selectedTopLabel,
    selectedTopColorLabel,
    selectedBodyLabel,
    selectedBackdropLabel,
    selectedAccessoryColorLabel,
    selectedAccessoryLabel,
    avatarPreviewUrl,
    avatarPortraitUrl,
    getAvatarOptionLabel,
    getEyeGlyphStyle,
    getHairGlyphStyle,
    getTopGlyphStyle,
    getBodyGlyphStyle,
    getAccessoryGlyphStyle,
    createAvatarOptionPreview,
    randomizeCartoonAvatar,
    saveCartoonAvatar,
    createPlayfulAvatarDataUrl,
    createPlayfulAvatarSvg,
    createAnimeAvatarDataUrl,
    createAnimeAvatarSvg,
  };
}

function getStoredFullAvatar(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const legacyFullAvatar = window.localStorage.getItem(FULL_AVATAR_STORAGE_KEY) || '';
  if (legacyFullAvatar) {
    window.localStorage.removeItem(FULL_AVATAR_STORAGE_KEY);
  }
  return '';
}

function getStoredCartoonAvatar(): Partial<CartoonAvatarConfig> {
  if (typeof window === 'undefined') {
    return {};
  }
  const stored = window.localStorage.getItem(CARTOON_AVATAR_STORAGE_KEY);
  if (!stored) {
    return {};
  }
  try {
    const parsed = JSON.parse(stored) as Partial<CartoonAvatarConfig>;
    const result: Partial<CartoonAvatarConfig> = {};
    if (typeof parsed.body === 'string') result.body = parsed.body;
    if (typeof parsed.face === 'string') result.face = parsed.face;
    if (typeof parsed.eyeColor === 'string') result.eyeColor = parsed.eyeColor;
    if (typeof parsed.hair === 'string') result.hair = parsed.hair;
    if (typeof parsed.hairColor === 'string') result.hairColor = parsed.hairColor;
    if (typeof parsed.shirt === 'string') result.shirt = parsed.shirt;
    if (typeof parsed.shirtColor === 'string') result.shirtColor = parsed.shirtColor;
    if (typeof parsed.pants === 'string') result.pants = parsed.pants;
    if (typeof parsed.pantsColor === 'string') result.pantsColor = parsed.pantsColor;
    if (typeof parsed.shoes === 'string') result.shoes = parsed.shoes;
    if (typeof parsed.accessoryColor === 'string') result.accessoryColor = parsed.accessoryColor;
    return result;
  } catch (error) {
    console.warn('Failed to parse cartoon avatar config', error);
    window.localStorage.removeItem(CARTOON_AVATAR_STORAGE_KEY);
    return {};
  }
}

function persistCartoonAvatar(config: CartoonAvatarConfig): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CARTOON_AVATAR_STORAGE_KEY, JSON.stringify(config));
}

function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

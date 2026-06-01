export const stickerCategories = [
  {
    id: 'all',
    name: 'Semua',
    stickers: ['💖', '✨', '⭐', '🌸', '🎀', '🐻', '🍓', '☁️', '🦋', '📸'],
  },
  {
    id: 'birthday',
    name: 'Ulang Tahun',
    stickers: ['🎂', '🎁', '🎈', '🥳', '🎉', '🧁', '🍰', '🍭'],
  },
  {
    id: 'love',
    name: 'Love',
    stickers: ['❤️', '💌', '💘', '💕', '🌹', '💍', '🫶', '😘'],
  },
  {
    id: 'cute',
    name: 'Cute',
    stickers: ['🐰', '🐱', '🐶', '🧸', '🍓', '🍒', '🍡', '🍥'],
  },
  {
    id: 'game',
    name: 'Game',
    stickers: ['🎮', '🕹️', '⭐', '💎', '👾', '⚡', '🔥', '🏆'],
  },
  {
    id: 'school',
    name: 'School',
    stickers: ['🎓', '📚', '✏️', '📝', '📌', '🏫', '📖', '💡'],
  },
]

export const stickers = stickerCategories.flatMap((category) => category.stickers)
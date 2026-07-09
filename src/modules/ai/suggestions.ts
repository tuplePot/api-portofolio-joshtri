// Suggested starter questions shown in the chat panel. Bilingual so the UI can
// render per the active language. Served via GET /ai/suggestions.
export const SUGGESTED_QUESTIONS = {
  en: [
    'Tell me about Josh.',
    'Summarize this portfolio.',
    'Which backend projects do you recommend?',
    'Explain your architecture.',
    'Show projects using Docker.',
    'Compare your two best projects.',
    'Which technologies do you use the most?',
    'What project are you most proud of?',
  ],
  id: [
    'Ceritakan tentang Josh.',
    'Ringkas portofolio ini.',
    'Proyek backend mana yang kamu rekomendasikan?',
    'Jelaskan arsitekturmu.',
    'Tunjukkan proyek yang memakai Docker.',
    'Bandingkan dua proyek terbaikmu.',
    'Teknologi apa yang paling sering kamu pakai?',
    'Proyek apa yang paling kamu banggakan?',
  ],
} as const

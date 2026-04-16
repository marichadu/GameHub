// Connections puzzle data — bilingual
// 4 difficulty levels per puzzle:
//   🟨 yellow  = straightforward
//   🟩 green   = needs a little thought
//   🟦 blue    = tricky hidden link
//   🟪 purple  = devious — words look like they belong elsewhere!

export const PUZZLES_FR = [
  // ── Puzzle 1 : Le piège Python / Rubis ──────────────────────────────────
  // Piège : PYTHON est AUSSI un serpent · RUBIS est AUSSI un langage de prog
  {
    groups: [
      { label: '🟨 Langages de programmation',  color: '#eab308', words: ['PYTHON','JAVA','SWIFT','RUST'] },
      { label: '🟩 Pierres précieuses',          color: '#22c55e', words: ['RUBIS','OPALE','JADE','AMBRE'] },
      { label: '🟦 ___phone',                    color: '#3b82f6', words: ['MICRO','SAXO','MÉGA','TÉLÉ'] },
      { label: '🟪 Aussi des serpents',          color: '#a855f7', words: ['BOA','MAMBA','COBRA','VIPÈRE'] },
    ]
  },

  // ── Puzzle 2 : Double vie des mots ──────────────────────────────────────
  // Piège : BAR = poisson ET café · CARPE = poisson ET "carpe diem"
  //         GOLF = voiture ET sport · PANDA = voiture ET animal
  {
    groups: [
      { label: '🟨 Poissons (qui font autre chose)',  color: '#eab308', words: ['SOLE','BAR','CARPE','BROCHET'] },
      { label: '🟩 Types de nuages',                  color: '#22c55e', words: ['CUMULUS','STRATUS','NIMBUS','CIRRUS'] },
      { label: '🟦 Après SOUS-',                      color: '#3b82f6', words: ['MARIN','CHEF','SOL','TITRE'] },
      { label: '🟪 Aussi des modèles de voitures',    color: '#a855f7', words: ['GOLF','PANDA','MUSTANG','VIPER'] },
    ]
  },

  // ── Puzzle 3 : Planètes & faux amis ─────────────────────────────────────
  // Piège : ROSE = planète? non → prénom & fleur
  //         MARS = planète ET barre chocolatée · JASMIN = Aladdin ET fleur
  //         NICHE / ALSO / MAIL / TANGO sont des anagrammes de pays
  {
    groups: [
      { label: '🟨 Planètes du système solaire',       color: '#eab308', words: ['MARS','VÉNUS','TERRE','URANUS'] },
      { label: '🟩 Disciplines olympiques',             color: '#22c55e', words: ['JUDO','BOXE','LUTTE','ESCRIME'] },
      { label: '🟦 Prénoms féminins (aussi des fleurs)',color: '#3b82f6', words: ['ROSE','IRIS','JASMIN','VIOLETTE'] },
      { label: '🟪 Anagrammes de pays',                color: '#a855f7', words: ['NICHE','ALSO','MAIL','TANGO'] },
      // NICHE=CHINE · ALSO=LAOS · MAIL=MALI · TANGO=TONGA
    ]
  },

  // ── Puzzle 4 : Dev Life ──────────────────────────────────────────────────
  // Piège : PUSH / PULL = Git ET physique · FLOAT = type ET nager · CTRL = touche ET contrôle
  {
    groups: [
      { label: '🟨 Commandes Git',       color: '#eab308', words: ['PUSH','PULL','MERGE','CLONE'] },
      { label: '🟩 Protocoles internet', color: '#22c55e', words: ['HTTP','FTP','SSH','DNS'] },
      { label: '🟦 Types de données',    color: '#3b82f6', words: ['INT','FLOAT','BOOL','CHAR'] },
      { label: '🟪 Touches du clavier',  color: '#a855f7', words: ['TAB','ESC','ALT','CTRL'] },
    ]
  },

  // ── Puzzle 5 : Musique & grand- ──────────────────────────────────────────
  // Piège : TUBA = instrument ET tuba (plongée) · OR / FER = éléments ET mots courants
  //         GAMAY = cépage ET ressemble à un nom
  {
    groups: [
      { label: '🟨 Instruments à vent',      color: '#eab308', words: ['FLÛTE','BASSON','TUBA','HAUTBOIS'] },
      { label: '🟩 Cépages / vins',          color: '#22c55e', words: ['MUSCAT','MERLOT','GAMAY','MALBEC'] },
      { label: '🟦 Après GRAND-',            color: '#3b82f6', words: ['PÈRE','MÈRE','ROUTE','CHOSE'] },
      { label: '🟪 Éléments chimiques',      color: '#a855f7', words: ['FER','ZINC','NÉON','ARGON'] },
    ]
  },
]

export const PUZZLES_EN = [
  // ── Puzzle 1 : The Python / Ruby trap ───────────────────────────────────
  // Trap: PYTHON is also a snake · RUBY is also a gemstone
  //       SWIFT is also a bird · RUST is also corrosion
  {
    groups: [
      { label: '🟨 Programming languages',  color: '#eab308', words: ['PYTHON','JAVA','SWIFT','RUST'] },
      { label: '🟩 Gemstones',              color: '#22c55e', words: ['RUBY','OPAL','JADE','AMBER'] },
      { label: '🟦 ___phone',               color: '#3b82f6', words: ['MICRO','SAXO','MEGA','TELE'] },
      { label: '🟪 Also snakes',            color: '#a855f7', words: ['BOA','MAMBA','COBRA','VIPER'] },
    ]
  },

  // ── Puzzle 2 : Hidden compound words ────────────────────────────────────
  // Trap: BOLT = THUNDERBOLT or DEADBOLT? · STAR = STARFISH or ROCKSTAR?
  {
    groups: [
      { label: '🟨 DEAD ___',     color: '#eab308', words: ['HEAT','LOCK','PAN','WOOD'] },
      { label: '🟩 ___ FISH',     color: '#22c55e', words: ['SWORD','STAR','CAT','BLOW'] },
      { label: '🟦 THUNDER ___',  color: '#3b82f6', words: ['BIRD','BOLT','CLAP','STORM'] },
      { label: '🟪 BLUE ___',     color: '#a855f7', words: ['TOOTH','BELL','PRINT','BERRY'] },
    ]
  },

  // ── Puzzle 3 : Cars in disguise / anagram countries ─────────────────────
  // Trap: GOLF = sport or car · PANDA = animal or car · MUSTANG = horse or car · VIPER = snake or car
  //       RAIN / MOAN / TANGO / ALSO are anagrams of countries
  {
    groups: [
      { label: '🟨 Olympic sports',         color: '#eab308', words: ['JUDO','BOXING','ROWING','FENCING'] },
      { label: '🟩 Also a car model',       color: '#22c55e', words: ['GOLF','PANDA','MUSTANG','VIPER'] },
      { label: '🟦 Planets (hiding brands)',color: '#3b82f6', words: ['MARS','VENUS','MERCURY','SATURN'] },
      { label: '🟪 Anagram of a country',   color: '#a855f7', words: ['RAIN','MOAN','TANGO','ALSO'] },
      // RAIN=IRAN · MOAN=OMAN · TANGO=TONGA · ALSO=LAOS
    ]
  },

  // ── Puzzle 4 : Dev Life ──────────────────────────────────────────────────
  {
    groups: [
      { label: '🟨 Git commands',       color: '#eab308', words: ['PUSH','PULL','MERGE','CLONE'] },
      { label: '🟩 Internet protocols', color: '#22c55e', words: ['HTTP','FTP','SSH','DNS'] },
      { label: '🟦 Data types',         color: '#3b82f6', words: ['INT','FLOAT','BOOL','CHAR'] },
      { label: '🟪 Keyboard keys',      color: '#a855f7', words: ['TAB','ESC','ALT','CTRL'] },
    ]
  },

  // ── Puzzle 5 : OVER___ / ___ BALL ───────────────────────────────────────
  // Trap: SWING = dance or playground or jazz or political swing
  //       COME / LOOK / TAKE / TURN all follow OVER (overcome, overlook…)
  {
    groups: [
      { label: '🟨 ___ BALL',        color: '#eab308', words: ['FOOT','BASE','BASKET','HAND'] },
      { label: '🟩 Types of clouds', color: '#22c55e', words: ['CUMULUS','STRATUS','NIMBUS','CIRRUS'] },
      { label: '🟦 Also a dance',    color: '#3b82f6', words: ['SALSA','TANGO','RUMBA','SWING'] },
      { label: '🟪 OVER ___',        color: '#a855f7', words: ['COME','LOOK','TAKE','TURN'] },
    ]
  },
]

export function getRandomPuzzle(lang) {
  const list = lang === 'fr' ? PUZZLES_FR : PUZZLES_EN
  return list[Math.floor(Math.random() * list.length)]
}

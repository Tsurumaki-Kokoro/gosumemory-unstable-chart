export interface RootObject {
  settings: Settings;
  menu: Menu;
  gameplay: Gameplay;
  resultsScreen: ResultsScreen;
  tourney: Tourney;
}

interface Tourney {
  manager: Manager;
  ipcClients?: any;
}

interface Manager {
  ipcState: number;
  bestOF: number;
  teamName: TeamName;
  stars: Stars;
  bools: Bools;
  chat?: any;
  gameplay: Gameplay2;
}

interface Gameplay2 {
  score: Stars;
}

interface Bools {
  scoreVisible: boolean;
  starsVisible: boolean;
}

interface Stars {
  left: number;
  right: number;
}

interface TeamName {
  left: string;
  right: string;
}

interface ResultsScreen {
  '0': number;
  '50': number;
  '100': number;
  '300': number;
  name: string;
  score: number;
  maxCombo: number;
  mods: Mods;
  geki: number;
  katu: number;
}

interface Gameplay {
  gameMode: number;
  name: string;
  score: number;
  accuracy: number;
  combo: Combo;
  hp: Hp;
  hits: Hits;
  pp: Pp2;
  keyOverlay: KeyOverlay;
  leaderboard: Leaderboard;
}

interface Leaderboard {
  hasLeaderboard: boolean;
  isVisible: boolean;
  ourplayer: Ourplayer;
  slots?: any;
}

interface Ourplayer {
  name: string;
  score: number;
  combo: number;
  maxCombo: number;
  mods: string;
  h300: number;
  h100: number;
  h50: number;
  h0: number;
  team: number;
  position: number;
  isPassing: number;
}

interface KeyOverlay {
  k1: K1;
  k2: K1;
  m1: K1;
  m2: K1;
}

interface K1 {
  isPressed: boolean;
  count: number;
}

interface Pp2 {
  current: number;
  fc: number;
  maxThisPlay: number;
}

interface Hits {
  '0': number;
  '50': number;
  '100': number;
  '300': number;
  geki: number;
  katu: number;
  sliderBreaks: number;
  grade: Grade;
  unstableRate: number;
  hitErrorArray?: any;
}

interface Grade {
  current: string;
  maxThisPlay: string;
}

interface Hp {
  normal: number;
  smooth: number;
}

interface Combo {
  current: number;
  max: number;
}

interface Menu {
  mainMenu: MainMenu;
  state: number;
  gameMode: number;
  isChatEnabled: number;
  bm: Bm;
  mods: Mods;
  pp: Pp;
}

interface Pp {
  '95': number;
  '96': number;
  '97': number;
  '98': number;
  '99': number;
  '100': number;
  strains: number[];
}

interface Mods {
  num: number;
  str: string;
}

interface Bm {
  time: Time;
  id: number;
  set: number;
  md5: string;
  rankedStatus: number;
  metadata: Metadata;
  stats: Stats;
  path: Path;
}

interface Path {
  full: string;
  folder: string;
  file: string;
  bg: string;
  audio: string;
}

interface Stats {
  AR: number;
  CS: number;
  OD: number;
  HP: number;
  SR: number;
  BPM: BPM;
  maxCombo: number;
  fullSR: number;
  memoryAR: number;
  memoryCS: number;
  memoryOD: number;
  memoryHP: number;
}

interface BPM {
  min: number;
  max: number;
}

interface Metadata {
  artist: string;
  artistOriginal: string;
  title: string;
  titleOriginal: string;
  mapper: string;
  difficulty: string;
}

interface Time {
  firstObj: number;
  current: number;
  full: number;
  mp3: number;
}

interface MainMenu {
  bassDensity: number;
}

interface Settings {
  showInterface: boolean;
  folders: Folders;
}

interface Folders {
  game: string;
  skin: string;
  songs: string;
}

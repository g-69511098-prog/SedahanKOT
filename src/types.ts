export interface House {
  id: string;
  name: string;
  shortName: string;
  colorName: string;
  colorHex: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export type EventCategoryGender = 'LELAKI' | 'PEREMPUAN' | 'L/P' | 'CAMPURAN';
export type EventKind = 'Balapan' | 'Padang';
export type EventType = 'Individu' | 'Berpasukan';

export interface SportEvent {
  id: string;
  session: 'Hari 1' | 'Hari 2';
  bil: number;
  time: string;
  name: string;
  categoryGender: EventCategoryGender;
  categoryAge: string;
  kind: EventKind;
  type: EventType;
  currentRecord?: string;
  recordHolder?: string;
  recordYear?: string;
  unit: 's' | 'm' | 'min'; // seconds, meters, etc.
}

export interface AthleteRegistration {
  id: string;
  eventId: string;
  houseId: string;
  athleteName: string;
  bibNumber?: string;
  className?: string;
  laneOrTurn?: number; // Lorong (Balapan: 1-8) or Giliran (Padang: 1-12)
}

export interface WinnerPlacement {
  position: 1 | 2 | 3;
  houseId: string;
  athleteName: string;
  score: string; // e.g. "13.42s" or "3.95m"
  isNewRecord?: boolean;
  notes?: string;
}

export interface EventResult {
  eventId: string;
  completedAt?: string;
  winners: WinnerPlacement[];
  notes?: string;
}

export interface HouseStanding {
  house: House;
  gold: number;
  silver: number;
  bronze: number;
  totalMedals: number;
  rank: number;
}

export interface TournamentConfig {
  title: string;
  edition: string;
  schoolName: string;
  year: string;
  day1Title: string;
  day1Date: string;
  day2Title: string;
  day2Date: string;
}

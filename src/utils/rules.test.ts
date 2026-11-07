import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAthleteLimits,
  getAthleteParticipation,
  calculateHouseStandings,
  checkIsNewRecord,
  generateExcelWorkbook,
  parseUploadedExcel,
} from './rules';
import { SportEvent, House, TournamentConfig, AthleteRegistration, EventResult } from '../types';

const mockHouses: House[] = [
  { id: 'hijau', name: 'Rumah Hijau', shortName: 'HIJAU', colorName: 'Hijau', colorHex: '#16a34a', badgeBg: '', badgeBorder: '', badgeText: '' },
  { id: 'merah', name: 'Rumah Merah', shortName: 'MERAH', colorName: 'Merah', colorHex: '#dc2626', badgeBg: '', badgeBorder: '', badgeText: '' },
  { id: 'biru', name: 'Rumah Biru', shortName: 'BIRU', colorName: 'Biru', colorHex: '#2563eb', badgeBg: '', badgeBorder: '', badgeText: '' },
];

const mockEvents: SportEvent[] = [
  { id: 'e1', session: 'Hari 1', bil: 1, time: '08:00', name: '100M LELAKI', categoryGender: 'LELAKI', categoryAge: 'TAHUN 4/5/6', kind: 'Balapan', type: 'Individu', currentRecord: '13.50', unit: 's' },
  { id: 'e2', session: 'Hari 1', bil: 2, time: '08:30', name: '200M LELAKI', categoryGender: 'LELAKI', categoryAge: 'TAHUN 4/5/6', kind: 'Balapan', type: 'Individu', currentRecord: '28.00', unit: 's' },
  { id: 'e3', session: 'Hari 1', bil: 3, time: '09:00', name: 'LOMPAT JAUH LELAKI', categoryGender: 'LELAKI', categoryAge: 'TAHUN 4/5/6', kind: 'Padang', type: 'Individu', currentRecord: '3.90', unit: 'm' },
  { id: 'e4', session: 'Hari 1', bil: 4, time: '10:00', name: '4x100M LELAKI', categoryGender: 'LELAKI', categoryAge: 'TAHUN 4/5/6', kind: 'Balapan', type: 'Berpasukan', currentRecord: '58.00', unit: 's' },
  { id: 'e5', session: 'Hari 1', bil: 5, time: '10:30', name: '4x200M LELAKI', categoryGender: 'LELAKI', categoryAge: 'TAHUN 4/5/6', kind: 'Balapan', type: 'Berpasukan', currentRecord: '125.00', unit: 's' },
  { id: 'e6', session: 'Hari 1', bil: 6, time: '11:00', name: '5x50M PRA', categoryGender: 'CAMPURAN', categoryAge: 'PRA', kind: 'Balapan', type: 'Berpasukan', currentRecord: '55.00', unit: 's' },
];

const mockConfig: TournamentConfig = {
  title: 'KEJOHANAN PADANG & BALAPAN',
  edition: 'KALI KE-14',
  schoolName: 'SK MANDAHAN',
  year: '2026',
  day1Title: 'Hari 1',
  day1Date: '23 Okt 2026',
  day2Title: 'Hari 2',
  day2Date: '24 Okt 2026',
  goldPoints: 7,
  silverPoints: 5,
  bronzePoints: 3,
  fourthPoints: 1,
};

test('validateAthleteLimits: allows up to 2 individual and 2 team events', () => {
  const registrations: AthleteRegistration[] = [
    { id: 'r1', eventId: 'e1', houseId: 'hijau', athleteName: 'Ahmad Albab' },
  ];

  // 1st individual event exists; registering for 2nd individual event should succeed
  const result1 = validateAthleteLimits(registrations, mockEvents, 'Ahmad Albab', 'Individu');
  assert.equal(result1.valid, true);
  assert.equal(result1.individualCount, 1);

  // Add 2nd individual event
  registrations.push({ id: 'r2', eventId: 'e2', houseId: 'hijau', athleteName: 'Ahmad Albab' });

  // 3rd individual event should be REJECTED
  const result2 = validateAthleteLimits(registrations, mockEvents, 'Ahmad Albab', 'Individu');
  assert.equal(result2.valid, false);
  assert.equal(result2.individualCount, 2);
  assert.match(result2.message || '', /had maksimum 2 acara individu/);

  // But can still register for team events!
  const resultTeam1 = validateAthleteLimits(registrations, mockEvents, 'Ahmad Albab', 'Berpasukan');
  assert.equal(resultTeam1.valid, true);

  registrations.push({ id: 'r3', eventId: 'e4', houseId: 'hijau', athleteName: 'Ahmad Albab' });
  registrations.push({ id: 'r4', eventId: 'e5', houseId: 'hijau', athleteName: 'Ahmad Albab' });

  // 3rd team event should be REJECTED
  const resultTeam3 = validateAthleteLimits(registrations, mockEvents, 'Ahmad Albab', 'Berpasukan');
  assert.equal(resultTeam3.valid, false);
  assert.equal(resultTeam3.teamCount, 2);
  assert.match(resultTeam3.message || '', /had maksimum 2 acara berpasukan/);
});

test('checkIsNewRecord: track event faster time is new record; field event longer distance is new record', () => {
  // Track event: 13.50s current record. 13.20s is faster -> new record!
  assert.equal(checkIsNewRecord('13.50', '13.20s', 'Balapan'), true);
  // 13.80s is slower -> not a record
  assert.equal(checkIsNewRecord('13.50', '13.80s', 'Balapan'), false);

  // Field event: 3.90m current record. 4.10m is farther -> new record!
  assert.equal(checkIsNewRecord('3.90', '4.10m', 'Padang'), true);
  // 3.80m is shorter -> not a record
  assert.equal(checkIsNewRecord('3.90', '3.80m', 'Padang'), false);
});

test('calculateHouseStandings: correctly computes medal tally, points, and Johan Keseluruhan rank', () => {
  const results: EventResult[] = [
    {
      eventId: 'e1',
      winners: [
        { position: 1, houseId: 'hijau', athleteName: 'Ahmad', score: '13.20s' }, // 7 pts
        { position: 2, houseId: 'merah', athleteName: 'Badrul', score: '13.40s' }, // 5 pts
        { position: 3, houseId: 'biru', athleteName: 'Chong', score: '13.60s' },   // 3 pts
        { position: 4, houseId: 'merah', athleteName: 'Danial', score: '13.80s' },  // 1 pt
      ],
    },
    {
      eventId: 'e2',
      winners: [
        { position: 1, houseId: 'hijau', athleteName: 'Ahmad', score: '27.50s' }, // 7 pts
        { position: 2, houseId: 'biru', athleteName: 'Farid', score: '28.10s' },   // 5 pts
        { position: 3, houseId: 'merah', athleteName: 'Badrul', score: '28.50s' }, // 3 pts
      ],
    },
  ];

  const standings = calculateHouseStandings(mockHouses, results, mockConfig);
  // Hijau: 2 Golds (14 pts) -> Rank 1 (Johan)
  // Merah: 0 Gold, 1 Silver, 1 Bronze, 1 Fourth = 5 + 3 + 1 = 9 pts
  // Biru: 0 Gold, 1 Silver, 1 Bronze = 5 + 3 = 8 pts
  assert.equal(standings[0].house.id, 'hijau');
  assert.equal(standings[0].gold, 2);
  assert.equal(standings[0].totalPoints, 14);
  assert.equal(standings[0].rank, 1);

  assert.equal(standings[1].house.id, 'merah');
  assert.equal(standings[1].totalPoints, 9);
  assert.equal(standings[1].rank, 2);

  assert.equal(standings[2].house.id, 'biru');
  assert.equal(standings[2].totalPoints, 8);
  assert.equal(standings[2].rank, 3);
});

test('generateExcelWorkbook and parseUploadedExcel: round-trip excel generation and parsing', () => {
  const initialRegs: AthleteRegistration[] = [
    { id: 'r1', eventId: 'e1', houseId: 'hijau', athleteName: 'Siti Aminah', bibNumber: 'H10', className: '5 ARIF', laneOrTurn: 3 },
  ];

  const excelBytes = generateExcelWorkbook(mockConfig, mockHouses, mockEvents, initialRegs);
  assert.ok(excelBytes.length > 500, 'Excel binary should be generated');

  const parsed = parseUploadedExcel(excelBytes, mockEvents, mockHouses);
  assert.equal(parsed.errors.length, 0);
  assert.ok(parsed.registrations.length >= 1);
  const found = parsed.registrations.find((r) => r.athleteName === 'Siti Aminah');
  assert.ok(found, 'Should find Siti Aminah in parsed registrations');
  assert.equal(found?.eventId, 'e1');
  assert.equal(found?.houseId, 'hijau');
});

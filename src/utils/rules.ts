import * as XLSX from 'xlsx';
import {
  AthleteRegistration,
  House,
  HouseStanding,
  SportEvent,
  TournamentConfig,
  EventResult,
  EventType,
} from '../types';

export interface ValidationResult {
  valid: boolean;
  athleteName: string;
  individualCount: number;
  teamCount: number;
  maxIndividualReached: boolean;
  maxTeamReached: boolean;
  message?: string;
}

export function normalizeName(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Calculates current event count for an athlete across all registrations.
 */
export function getAthleteParticipation(
  registrations: AthleteRegistration[],
  events: SportEvent[],
  athleteName: string,
  excludeRegistrationId?: string
): { individualCount: number; teamCount: number; registeredEvents: SportEvent[] } {
  const norm = normalizeName(athleteName);
  if (!norm) {
    return { individualCount: 0, teamCount: 0, registeredEvents: [] };
  }

  const eventMap = new Map<string, SportEvent>(events.map((e) => [e.id, e]));
  let individualCount = 0;
  let teamCount = 0;
  const registeredEvents: SportEvent[] = [];

  for (const reg of registrations) {
    if (excludeRegistrationId && reg.id === excludeRegistrationId) continue;
    if (normalizeName(reg.athleteName) === norm) {
      const ev = eventMap.get(reg.eventId);
      if (ev) {
        registeredEvents.push(ev);
        if (ev.type === 'Individu') {
          individualCount++;
        } else if (ev.type === 'Berpasukan') {
          teamCount++;
        }
      }
    }
  }

  return { individualCount, teamCount, registeredEvents };
}

/**
 * Validates athlete limit:
 * Maksimum 2 acara individu dan 2 acara berpasukan sahaja.
 */
export function validateAthleteLimits(
  registrations: AthleteRegistration[],
  events: SportEvent[],
  athleteName: string,
  targetEventType: EventType,
  excludeRegistrationId?: string
): ValidationResult {
  const { individualCount, teamCount } = getAthleteParticipation(
    registrations,
    events,
    athleteName,
    excludeRegistrationId
  );

  const maxIndividualReached = individualCount >= 2;
  const maxTeamReached = teamCount >= 2;

  if (targetEventType === 'Individu' && maxIndividualReached) {
    return {
      valid: false,
      athleteName,
      individualCount,
      teamCount,
      maxIndividualReached: true,
      maxTeamReached,
      message: `Atlit "${athleteName}" telah mencapai had maksimum 2 acara individu (${individualCount}/2). Pendaftaran ditolak.`,
    };
  }

  if (targetEventType === 'Berpasukan' && maxTeamReached) {
    return {
      valid: false,
      athleteName,
      individualCount,
      teamCount,
      maxIndividualReached,
      maxTeamReached: true,
      message: `Atlit/Pasukan "${athleteName}" telah mencapai had maksimum 2 acara berpasukan (${teamCount}/2). Pendaftaran ditolak.`,
    };
  }

  return {
    valid: true,
    athleteName,
    individualCount,
    teamCount,
    maxIndividualReached,
    maxTeamReached,
  };
}

/**
 * Calculates current standings across houses based on medal results and point values.
 */
export function calculateHouseStandings(
  houses: House[],
  results: EventResult[],
  _config?: TournamentConfig
): HouseStanding[] {
  const standingMap = new Map<string, { gold: number; silver: number; bronze: number }>();

  houses.forEach((h) => {
    standingMap.set(h.id, { gold: 0, silver: 0, bronze: 0 });
  });

  results.forEach((res) => {
    res.winners.forEach((w) => {
      const current = standingMap.get(w.houseId);
      if (!current) return;

      if (w.position === 1) {
        current.gold += 1;
      } else if (w.position === 2) {
        current.silver += 1;
      } else if (w.position === 3) {
        current.bronze += 1;
      }
    });
  });

  const standings: HouseStanding[] = houses.map((house) => {
    const data = standingMap.get(house.id) || { gold: 0, silver: 0, bronze: 0 };
    return {
      house,
      gold: data.gold,
      silver: data.silver,
      bronze: data.bronze,
      totalMedals: data.gold + data.silver + data.bronze,
      rank: 0,
    };
  });

  // Sort by Olympic/MSSM Medal Table: Gold desc, then Silver desc, then Bronze desc, then Total Medals desc
  standings.sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return b.totalMedals - a.totalMedals;
  });

  // Assign ranks
  standings.forEach((st, idx) => {
    st.rank = idx + 1;
  });

  return standings;
}

/**
 * Check if a new score breaks existing championship record.
 */
export function checkIsNewRecord(
  currentRecordStr: string | undefined,
  newScoreStr: string | undefined,
  kind: 'Balapan' | 'Padang'
): boolean {
  if (!currentRecordStr || !newScoreStr) return false;

  const parseScore = (str: string): number | null => {
    // extract digits and decimal
    const cleaned = str.replace(/[^\d.:]/g, '').trim();
    if (!cleaned) return null;

    // Check if time has minutes, e.g. "1:02.10" or "2:12.4"
    if (cleaned.includes(':')) {
      const [m, s] = cleaned.split(':');
      const minVal = parseFloat(m);
      const secVal = parseFloat(s);
      if (!isNaN(minVal) && !isNaN(secVal)) {
        return minVal * 60 + secVal;
      }
    }

    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  };

  const currentVal = parseScore(currentRecordStr);
  const newVal = parseScore(newScoreStr);

  if (currentVal === null || newVal === null) return false;

  if (kind === 'Balapan') {
    // In track events, faster (smaller time) is a new record!
    return newVal < currentVal;
  } else {
    // In field events (distance or height), higher is a new record!
    return newVal > currentVal;
  }
}

/**
 * Generates an Excel Template Workbook with sheets for each house and import template.
 */
export function generateExcelWorkbook(
  config: TournamentConfig,
  houses: House[],
  events: SportEvent[],
  existingRegistrations: AthleteRegistration[]
): Uint8Array {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Panduan
  const guideData = [
    [config.schoolName],
    [`${config.title} ${config.edition} ${config.year}`],
    ['PANDUAN & SYARAT PENDAFTARAN ATLETIK'],
    [''],
    ['1. SYARAT PENYERTAAN:'],
    ['   - Setiap murid/atlit hanya dibenarkan mengambil bahagian dalam:'],
    ['     * MAKSIMUM 2 ACARA INDIVIDU'],
    ['     * MAKSIMUM 2 ACARA BERPASUKAN (Kuartet / Larian Berganti-ganti)'],
    ['2. RUMAH SUKAN:'],
    ...houses.map((h) => [`   - ${h.name.toUpperCase()} (${h.id})`]),
    [''],
    ['3. ARAHAN MENGISI BORANG:'],
    ['   - Sila isi helaian "BORANG_PENDAFTARAN" mengikut Kod Acara dan Rumah Sukan.'],
    ['   - Simpan fail ini dan muat naik semula ke sistem.'],
    ['   - Sistem akan mengesahkan kuota 2 acara individu & 2 acara berpasukan secara automatik.'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  XLSX.utils.book_append_sheet(wb, wsGuide, 'PANDUAN');

  // 2. Sheet Senarai Acara
  const eventHeader = [
    'KOD_ACARA',
    'SESI',
    'BIL',
    'MASA',
    'NAMA_ACARA',
    'KATEGORI_JANTINA',
    'KATEGORI_UMUR',
    'JENIS_ACARA',
    'KATEGORI',
    'REKOD_SEMASA',
    'PEMEGANG_REKOD',
  ];
  const eventRows = events.map((ev) => [
    ev.id,
    ev.session,
    ev.bil,
    ev.time,
    ev.name,
    ev.categoryGender,
    ev.categoryAge,
    ev.type,
    ev.kind,
    ev.currentRecord ? `${ev.currentRecord} ${ev.unit}` : '-',
    ev.recordHolder || '-',
  ]);
  const wsEvents = XLSX.utils.aoa_to_sheet([eventHeader, ...eventRows]);
  XLSX.utils.book_append_sheet(wb, wsEvents, 'SENARAI_ACARA');

  // 3. Sheet Template Pendaftaran Utama
  const regHeader = [
    'KOD_ACARA',
    'NAMA_ACARA',
    'JENIS_ACARA',
    'RUMAH_SUKAN',
    'NAMA_ATLIT',
    'NO_BIB',
    'KELAS',
    'LORONG_ATAU_GILIRAN',
  ];

  // Pre-fill rows for each event and each house so teachers can just write athlete names!
  const regRows: (string | number)[][] = [];

  // Include existing registrations if any
  if (existingRegistrations.length > 0) {
    const eventMap = new Map(events.map((e) => [e.id, e]));
    const houseMap = new Map(houses.map((h) => [h.id, h]));
    existingRegistrations.forEach((r) => {
      const ev = eventMap.get(r.eventId);
      const h = houseMap.get(r.houseId);
      regRows.push([
        r.eventId,
        ev?.name || r.eventId,
        ev?.type || 'Individu',
        h?.name || r.houseId,
        r.athleteName,
        r.bibNumber || '',
        r.className || '',
        r.laneOrTurn || '',
      ]);
    });
  } else {
    // Generate empty rows for each event x each house
    events.forEach((ev) => {
      houses.forEach((h) => {
        regRows.push([
          ev.id,
          ev.name,
          ev.type,
          h.name,
          '', // athlete name
          '', // bib
          '', // class
          '', // lane
        ]);
      });
    });
  }

  const wsReg = XLSX.utils.aoa_to_sheet([regHeader, ...regRows]);
  XLSX.utils.book_append_sheet(wb, wsReg, 'BORANG_PENDAFTARAN');

  // 4. Per-House Sheets (Rumah Hijau, Merah, Biru)
  houses.forEach((h) => {
    const houseRegs = existingRegistrations.filter((r) => r.houseId === h.id);
    const houseRows: (string | number)[][] = [
      [`BORANG PENDAFTARAN - ${h.name.toUpperCase()}`],
      [`Had: Maksimum 2 Acara Individu & 2 Acara Berpasukan Setiap Atlit`],
      [''],
      ['KOD_ACARA', 'NAMA_ACARA', 'JENIS', 'NAMA_ATLIT', 'NO_BIB', 'KELAS'],
    ];

    if (houseRegs.length > 0) {
      const eventMap = new Map(events.map((e) => [e.id, e]));
      houseRegs.forEach((r) => {
        const ev = eventMap.get(r.eventId);
        houseRows.push([
          r.eventId,
          ev?.name || r.eventId,
          ev?.type || 'Individu',
          r.athleteName,
          r.bibNumber || '',
          r.className || '',
        ]);
      });
    } else {
      events.forEach((ev) => {
        houseRows.push([ev.id, ev.name, ev.type, '', '', '']);
      });
    }

    const wsHouse = XLSX.utils.aoa_to_sheet(houseRows);
    const sheetName = h.name.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, wsHouse, sheetName);
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(wbout);
}

/**
 * Parses uploaded Excel binary data and maps into AthleteRegistration records.
 * Checks for athlete limit rules and returns summary.
 */
export function parseUploadedExcel(
  fileData: ArrayBuffer | Uint8Array,
  events: SportEvent[],
  houses: House[],
  currentRegistrations: AthleteRegistration[] = []
): {
  registrations: AthleteRegistration[];
  validCount: number;
  skippedCount: number;
  warnings: string[];
  errors: string[];
} {
  const wb = XLSX.read(fileData, { type: 'array' });
  const warnings: string[] = [];
  const errors: string[] = [];

  // Target sheet: try "BORANG_PENDAFTARAN", or first sheet that has KOD_ACARA
  let targetSheetName = wb.SheetNames.find(
    (name) => name.toUpperCase().includes('PENDAFTARAN') || name.toUpperCase().includes('BORANG')
  );

  if (!targetSheetName && wb.SheetNames.length > 0) {
    targetSheetName = wb.SheetNames[0];
  }

  if (!targetSheetName) {
    return {
      registrations: [],
      validCount: 0,
      skippedCount: 0,
      warnings: [],
      errors: ['Fail Excel tidak mengandungi helaian yang sah.'],
    };
  }

  const sheet = wb.Sheets[targetSheetName];
  const rawRows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });

  if (rawRows.length < 2) {
    return {
      registrations: [],
      validCount: 0,
      skippedCount: 0,
      warnings: [],
      errors: ['Helaian Excel kosong atau tidak mempunyai data pendaftaran.'],
    };
  }

  // Find header row
  let headerIndex = -1;
  let colKodAcara = -1;
  let colRumah = -1;
  let colNamaAtlit = -1;
  let colBib = -1;
  let colKelas = -1;
  let colLorong = -1;

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i] || [];
    const strRow = row.map((cell) => String(cell || '').toUpperCase().trim());

    const idxKod = strRow.findIndex((c) => c.includes('KOD_ACARA') || c.includes('KOD') || c.includes('ACARA_ID'));
    const idxNama = strRow.findIndex((c) => c.includes('NAMA_ATLIT') || c.includes('ATLIT') || c.includes('PESERTA'));
    const idxRumah = strRow.findIndex((c) => c.includes('RUMAH') || c.includes('HOUSE'));

    if (idxKod !== -1 && idxNama !== -1) {
      headerIndex = i;
      colKodAcara = idxKod;
      colNamaAtlit = idxNama;
      colRumah = idxRumah;
      colBib = strRow.findIndex((c) => c.includes('BIB') || c.includes('NO_BIB') || c.includes('NOMBOR'));
      colKelas = strRow.findIndex((c) => c.includes('KELAS') || c.includes('TAHUN') || c.includes('TINGKATAN'));
      colLorong = strRow.findIndex((c) => c.includes('LORONG') || c.includes('GILIRAN'));
      break;
    }
  }

  if (headerIndex === -1) {
    // If not found in primary sheet, try to check other sheets
    for (const sName of wb.SheetNames) {
      const s = wb.Sheets[sName];
      const sRows = XLSX.utils.sheet_to_json<(string | number)[]>(s, { header: 1 });
      for (let i = 0; i < Math.min(sRows.length, 10); i++) {
        const row = sRows[i] || [];
        const strRow = row.map((cell) => String(cell || '').toUpperCase().trim());
        const idxKod = strRow.findIndex((c) => c.includes('KOD_ACARA') || c.includes('KOD'));
        const idxNama = strRow.findIndex((c) => c.includes('NAMA_ATLIT') || c.includes('ATLIT'));
        if (idxKod !== -1 && idxNama !== -1) {
          headerIndex = i;
          colKodAcara = idxKod;
          colNamaAtlit = idxNama;
          colRumah = strRow.findIndex((c) => c.includes('RUMAH'));
          colBib = strRow.findIndex((c) => c.includes('BIB'));
          colKelas = strRow.findIndex((c) => c.includes('KELAS'));
          colLorong = strRow.findIndex((c) => c.includes('LORONG'));
          break;
        }
      }
      if (headerIndex !== -1) break;
    }
  }

  if (headerIndex === -1) {
    return {
      registrations: [],
      validCount: 0,
      skippedCount: 0,
      warnings: [],
      errors: ['Kolum KOD_ACARA atau NAMA_ATLIT tidak dijumpai dalam templat Excel.'],
    };
  }

  const eventMap = new Map(events.map((e) => [e.id.toLowerCase(), e]));
  // Also map by bil & name
  events.forEach((e) => {
    eventMap.set(e.name.toLowerCase().trim(), e);
  });

  const houseMap = new Map<string, House>();
  houses.forEach((h) => {
    houseMap.set(h.id.toLowerCase(), h);
    houseMap.set(h.name.toLowerCase(), h);
    houseMap.set(h.shortName.toLowerCase(), h);
    houseMap.set(h.colorName.toLowerCase(), h);
  });

  const newRegistrations: AthleteRegistration[] = [];
  // Use a copy of currentRegistrations to continuously validate limits during import
  const runningRegistrations: AthleteRegistration[] = [...currentRegistrations];
  let validCount = 0;
  let skippedCount = 0;

  for (let r = headerIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawKod = String(row[colKodAcara] || '').trim();
    const rawNama = String(row[colNamaAtlit] || '').trim();
    if (!rawNama) {
      skippedCount++;
      continue;
    }

    // Resolve event
    let targetEvent: SportEvent | undefined = eventMap.get(rawKod.toLowerCase());
    if (!targetEvent) {
      // Try fuzzy matching event name
      targetEvent = events.find((e) => rawKod.toLowerCase().includes(e.id.toLowerCase()) || e.name.toLowerCase().includes(rawKod.toLowerCase()));
    }

    if (!targetEvent) {
      warnings.push(`Baris ${r + 1}: Kod acara "${rawKod}" tidak ditemui dalam senarai acara. Baris diabaikan.`);
      continue;
    }

    // Resolve house
    let houseId = 'hijau';
    if (colRumah !== -1 && row[colRumah]) {
      const rawHouse = String(row[colRumah]).toLowerCase().trim();
      const matchedHouse = houseMap.get(rawHouse) || houses.find((h) => rawHouse.includes(h.colorName.toLowerCase()));
      if (matchedHouse) {
        houseId = matchedHouse.id;
      }
    }

    // Check limit
    const valResult = validateAthleteLimits(runningRegistrations, events, rawNama, targetEvent.type);
    if (!valResult.valid) {
      warnings.push(`Baris ${r + 1}: ${valResult.message}`);
      continue;
    }

    const regId = `reg-imp-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`;
    const bib = colBib !== -1 && row[colBib] ? String(row[colBib]).trim() : undefined;
    const cls = colKelas !== -1 && row[colKelas] ? String(row[colKelas]).trim() : undefined;
    const lane = colLorong !== -1 && row[colLorong] ? parseInt(String(row[colLorong]), 10) || undefined : undefined;

    const newReg: AthleteRegistration = {
      id: regId,
      eventId: targetEvent.id,
      houseId,
      athleteName: rawNama,
      bibNumber: bib,
      className: cls,
      laneOrTurn: lane,
    };

    newRegistrations.push(newReg);
    runningRegistrations.push(newReg);
    validCount++;
  }

  return {
    registrations: newRegistrations,
    validCount,
    skippedCount,
    warnings,
    errors,
  };
}

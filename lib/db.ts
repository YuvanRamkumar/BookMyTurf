import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password: Buffer | string;
  role: Role;
  is_approved: boolean;
}

export interface Turf {
  id: string;
  name: string;
  location: string;
  sport_type: 'Football/Cricket' | 'Pickleball';
  price_per_hour: number;
  opening_time: string; // HH:mm
  closing_time: string; // HH:mm
  admin_id: string;
  image_url?: string;
  is_approved: boolean;
  status: 'active' | 'maintenance' | 'closed';
}

export interface Slot {
  id: string;
  turf_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_booked: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  turf_id: string;
  slot_id: string;
  status: 'confirmed' | 'cancelled' | 'expired';
  booked_at: string;
  price_paid: number;
  cancellation_charge?: number;
}

interface Database {
  users: User[];
  turfs: Turf[];
  slots: Slot[];
  bookings: Booking[];
}

const initialData: Database = {
  users: [
    {
      id: 'sa1',
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: 'admin123', // In a real app, hash this properly
      role: 'SUPER_ADMIN',
      is_approved: true,
    },
    {
      id: 'a1',
      name: 'Turf Owner 1',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'ADMIN',
      is_approved: true,
    }
  ],
  turfs: [
    {
      id: 't1',
      name: 'Arena Sports Hub',
      location: 'Downtown',
      sport_type: 'Football/Cricket',
      price_per_hour: 1200,
      opening_time: '06:00',
      closing_time: '22:00',
      admin_id: 'a1',
      is_approved: true,
      status: 'active',
    },
    {
      id: 't2',
      name: 'Smash Pickle Arena',
      location: 'Suburbs',
      sport_type: 'Pickleball',
      price_per_hour: 800,
      opening_time: '07:00',
      closing_time: '21:00',
      admin_id: 'a1',
      is_approved: true,
      status: 'active',
    }
  ],
  slots: [],
  bookings: []
};

// Auto-generate slots for today for initial turfs
const generateInitialSlots = (turfs: Turf[]) => {
  const today = new Date().toISOString().split('T')[0];
  const slots: Slot[] = [];

  turfs.forEach(turf => {
    const startHour = parseInt(turf.opening_time.split(':')[0]);
    const endHour = parseInt(turf.closing_time.split(':')[0]);

    for (let h = startHour; h < endHour; h++) {
      slots.push({
        id: `s-${turf.id}-${today}-${h}`,
        turf_id: turf.id,
        date: today,
        start_time: `${h.toString().padStart(2, '0')}:00`,
        end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
        is_booked: false
      });
    }
  });
  return slots;
};

initialData.slots = generateInitialSlots(initialData.turfs);

export function getDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  // Maintenance: ensure all turfs have the status field
  let changed = false;
  data.turfs.forEach((t: any) => {
    if (!t.status) {
      t.status = 'active';
      changed = true;
    }
  });
  if (changed) saveDb(data);
  return data;
}

export function saveDb(data: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

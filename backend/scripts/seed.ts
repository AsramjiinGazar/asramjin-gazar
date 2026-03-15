/**
 * Seed script: creates 31 student users + profiles and 2 announcements.
 * Run from backend directory: npm run seed
 * Loads .env from backend/ or project root. Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET.
 * Idempotency: skips creating a user if email already exists (safe to re-run).
 */

import path from 'path';
import dotenv from 'dotenv';

// Load .env before any module that reads process.env (backend/ or project root)
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const SEED_PASSWORD = 'Password1';
const SALT_ROUNDS = 12;

const STUDENTS = [
  { name: 'Азбаяр', favoriteSubject: 'Computer Science' },
  { name: 'Алтангэрэл', favoriteSubject: 'Art' },
  { name: 'Амин-Эрдэнэ', favoriteSubject: 'Music' },
  { name: 'Амина', favoriteSubject: 'Physics' },
  { name: 'Бадамдорж', favoriteSubject: 'PE' },
  { name: 'Баярбаясгалан', favoriteSubject: 'English' },
  { name: 'Билгүүн', favoriteSubject: 'Mathematics' },
  { name: 'Билэгдэмбэрэл', favoriteSubject: 'Biology' },
  { name: 'Галдан', favoriteSubject: 'Biology' },
  { name: 'Гантигмаа', favoriteSubject: 'Biology' },
  { name: 'Маргад', favoriteSubject: 'Biology' },
  { name: 'О.Мишээл', favoriteSubject: 'Biology' },
  { name: 'Б.Мишээл', favoriteSubject: 'Biology' },
  { name: 'Н.Мишээл', favoriteSubject: 'Biology' },
  { name: 'Мөнххүслэн', favoriteSubject: 'Biology' },
  { name: 'Нарансондор', favoriteSubject: 'Biology' },
  { name: 'Сайханбилэг', favoriteSubject: 'Biology' },
  { name: 'Сандагдорж', favoriteSubject: 'Biology' },
  { name: 'Сувд', favoriteSubject: 'Biology' },
  { name: 'Сэргэлэн', favoriteSubject: 'Biology' },
  { name: 'Төгөлдөр', favoriteSubject: 'Biology' },
  { name: 'Төрболд', favoriteSubject: 'Biology' },
  { name: 'Түвшинзаяа', favoriteSubject: 'Biology' },
  { name: 'Тэмүүлэн', favoriteSubject: 'Biology' },
  { name: 'Тэргүүлэл', favoriteSubject: 'Biology' },
  { name: 'Хулан', favoriteSubject: 'Biology' },
  { name: 'Цолмонбилэг', favoriteSubject: 'Biology' },
  { name: 'Чингүн', favoriteSubject: 'Biology' },
  { name: 'Шинээбаяр', favoriteSubject: 'Biology' },
  { name: 'Энхжин', favoriteSubject: 'Biology' },
  { name: 'Энэрэлт-Од', favoriteSubject: 'Biology' },
];

const ANNOUNCEMENTS = [
  { title: 'Field Trip Next Friday!', content: "Don't forget permission slips for the science museum visit." },
  { title: 'Class Photo Day', content: "Wear your best smile this Wednesday!" },
];

async function seed() {
  const bcrypt = (await import('bcryptjs')).default;
  const { supabase } = await import('../src/db/supabase.js');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  let firstUserId: string | null = null;

  for (let i = 0; i < STUDENTS.length; i++) {
    const email = `student${i + 1}@class.local`;
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) {
      if (!firstUserId) firstUserId = existing.id;
      console.log(`Skip ${email} (already exists)`);
      continue;
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'student',
      })
      .select('id')
      .single();

    if (userError || !user) {
      console.error(`Failed to create ${email}:`, userError);
      throw new Error(`User insert failed: ${userError?.message}`);
    }
    if (!firstUserId) firstUserId = user.id;

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: user.id,
      full_name: STUDENTS[i].name,
      level: 0,
      total_xp: 0,
      favorite_subject: STUDENTS[i].favoriteSubject,
      success: '',
    });

    if (profileError) {
      console.error(`Failed to create profile for ${email}:`, profileError);
      await supabase.from('users').delete().eq('id', user.id);
      throw new Error(`Profile insert failed: ${profileError.message}`);
    }
    console.log(`Created ${email} (${STUDENTS[i].name})`);
  }

  if (!firstUserId) {
    console.log('No users created; fetching first user for announcements.');
    const { data: first } = await supabase.from('users').select('id').limit(1).single();
    firstUserId = first?.id ?? null;
  }

  if (firstUserId) {
    const { count } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
    if (count === 0) {
      for (const a of ANNOUNCEMENTS) {
        const { error: annError } = await supabase.from('announcements').insert({
          title: a.title,
          content: a.content,
          created_by: firstUserId,
        });
        if (annError) throw new Error(`Announcement insert failed: ${annError.message}`);
        console.log(`Announcement: ${a.title}`);
      }
    } else {
      console.log('Announcements already exist, skip.');
    }
  }

  console.log('Seed done. Login with student1@class.local / Password1');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

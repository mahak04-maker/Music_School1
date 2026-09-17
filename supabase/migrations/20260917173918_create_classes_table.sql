/*
# Create classes table for music school scheduler

1. New Tables
- `classes`
  - `id` (uuid, primary key, auto-generated)
  - `teacher_name` (text, not null) — name of the teacher
  - `subject` (text, not null) — one of: Vocals, Keyboard, Guitar
  - `day` (text, not null) — one of: Monday–Sunday
  - `start_time` (time, not null) — class start time
  - `end_time` (time, not null) — class end time
  - `room` (text, not null) — room name/number
  - `max_capacity` (integer, not null) — maximum students
  - `current_enrollment` (integer, default 0) — currently enrolled count
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `classes`.
- SELECT: public — anyone (anon + authenticated) can read the schedule.
- INSERT/UPDATE/DELETE: authenticated only — only the logged-in admin can modify.
- No user_id column needed: classes are shared school data, not owned by individual users.
  There is only a single admin account, so any authenticated user is the admin.

3. Seed Data
- Inserts sample classes for 3 teachers (Priya/Vocals, Arjun/Keyboard, Maya/Guitar)
  across multiple days so the app is testable immediately.
*/

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  subject text NOT NULL CHECK (subject IN ('Vocals', 'Keyboard', 'Guitar')),
  day text NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text NOT NULL,
  max_capacity integer NOT NULL CHECK (max_capacity > 0),
  current_enrollment integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can view the schedule
DROP POLICY IF EXISTS "public_read_classes" ON classes;
CREATE POLICY "public_read_classes"
  ON classes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write: only authenticated users can insert
DROP POLICY IF EXISTS "admin_insert_classes" ON classes;
CREATE POLICY "admin_insert_classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin write: only authenticated users can update
DROP POLICY IF EXISTS "admin_update_classes" ON classes;
CREATE POLICY "admin_update_classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Admin write: only authenticated users can delete
DROP POLICY IF EXISTS "admin_delete_classes" ON classes;
CREATE POLICY "admin_delete_classes"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- Seed data: sample classes for 3 teachers
INSERT INTO classes (teacher_name, subject, day, start_time, end_time, room, max_capacity, current_enrollment) VALUES
  ('Priya', 'Vocals', 'Monday', '16:00', '17:00', 'Studio A', 8, 6),
  ('Arjun', 'Keyboard', 'Monday', '17:30', '18:30', 'Room 2', 6, 6),
  ('Maya', 'Guitar', 'Tuesday', '16:00', '17:00', 'Studio B', 10, 4),
  ('Priya', 'Vocals', 'Wednesday', '15:00', '16:00', 'Studio A', 8, 3),
  ('Arjun', 'Keyboard', 'Thursday', '17:00', '18:00', 'Room 2', 6, 5),
  ('Maya', 'Guitar', 'Friday', '16:30', '17:30', 'Studio B', 10, 10),
  ('Priya', 'Vocals', 'Saturday', '10:00', '11:00', 'Studio A', 12, 7),
  ('Arjun', 'Keyboard', 'Saturday', '11:30', '12:30', 'Room 2', 6, 2),
  ('Maya', 'Guitar', 'Sunday', '11:00', '12:00', 'Studio B', 10, 5)
ON CONFLICT DO NOTHING;

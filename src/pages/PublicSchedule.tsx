import { useEffect, useState, useMemo } from 'react';
import { Music, Filter, Loader2 } from 'lucide-react';
import { supabase, TEACHERS, type ClassRow } from '@/lib/supabase';
import ScheduleView from '@/components/ScheduleView';

export default function PublicSchedule() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('day')
        .order('start_time');
      if (error) {
        setError('Could not load the schedule. Please try again later.');
      } else {
        setClasses((data as ClassRow[]) ?? []);
      }
      setLoading(false);
    }
    fetchClasses();
  }, []);

  const filtered = useMemo(() => {
    if (teacherFilter === 'all') return classes;
    return classes.filter((c) => c.teacher_name === teacherFilter);
  }, [classes, teacherFilter]);

  const availableTeachers = useMemo(() => {
    const names = new Set(classes.map((c) => c.teacher_name));
    return TEACHERS.filter((t) => names.has(t));
  }, [classes]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-stone-800 to-stone-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <Music className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Harmony Music School</h1>
              <p className="text-stone-300 text-sm">Weekly Class Schedule</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-600 mb-1.5 px-1">
            <Filter className="w-4 h-4" />
            Filter by teacher
          </label>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All Teachers</option>
            {availableTeachers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
            <p className="text-stone-500">Loading schedule…</p>
          </div>
        )}
        {error && (
          <div className="text-center py-12 px-4">
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <ScheduleView classes={filtered} />
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-stone-400">
          Harmony Music School · Same schedule every week
        </p>
        <a href="/login" className="inline-block mt-3 text-sm text-stone-400 hover:text-stone-600 underline">
          Owner Login
        </a>
      </footer>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Loader2, AlertCircle, X, Trash2, CheckCircle2 } from 'lucide-react';
import {
  supabase,
  TEACHERS,
  SUBJECTS,
  DAYS,
  type ClassRow,
} from '@/lib/supabase';
import { findConflict } from '@/lib/timeConflict';
import ScheduleView from '@/components/ScheduleView';

type FormState = {
  teacher_name: string;
  subject: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  max_capacity: string;
  current_enrollment: string;
};

const emptyForm: FormState = {
  teacher_name: '',
  subject: '',
  day: 'Monday',
  start_time: '16:00',
  end_time: '17:00',
  room: '',
  max_capacity: '8',
  current_enrollment: '0',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('day')
      .order('start_time');
    if (error) {
      setError('Could not load classes. Please try again.');
    } else {
      setClasses((data as ClassRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  function handleLogout() {
    supabase.auth.signOut();
    navigate('/');
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(cls: ClassRow) {
    setEditingId(cls.id);
    setForm({
      teacher_name: cls.teacher_name,
      subject: cls.subject,
      day: cls.day,
      start_time: cls.start_time,
      end_time: cls.end_time,
      room: cls.room,
      max_capacity: String(cls.max_capacity),
      current_enrollment: String(cls.current_enrollment),
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!form.teacher_name || !form.subject || !form.day || !form.room) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (form.start_time >= form.end_time) {
      setFormError('Start time must be before end time.');
      return;
    }
    const maxCap = parseInt(form.max_capacity, 10);
    if (isNaN(maxCap) || maxCap <= 0) {
      setFormError('Max capacity must be a positive number.');
      return;
    }
    const currentEnroll = parseInt(form.current_enrollment, 10) || 0;
    if (currentEnroll < 0) {
      setFormError('Current enrollment cannot be negative.');
      return;
    }
    if (currentEnroll > maxCap) {
      setFormError('Current enrollment cannot exceed max capacity.');
      return;
    }

    // Check for scheduling conflict
    const conflict = findConflict(
      classes,
      form.teacher_name,
      form.day,
      form.start_time,
      form.end_time,
      editingId ?? undefined
    );
    if (conflict) {
      setFormError(
        `${form.teacher_name} already has a class on ${form.day} from ${conflict.start_time.slice(0, 5)} to ${conflict.end_time.slice(0, 5)}. Please choose a different time.`
      );
      return;
    }

    setSaving(true);
    const payload = {
      teacher_name: form.teacher_name,
      subject: form.subject,
      day: form.day,
      start_time: form.start_time,
      end_time: form.end_time,
      room: form.room,
      max_capacity: maxCap,
      current_enrollment: currentEnroll,
    };

    if (editingId) {
      const { error } = await supabase.from('classes').update(payload).eq('id', editingId);
      setSaving(false);
      if (error) {
        setFormError('Could not save changes. Please try again.');
        return;
      }
      setSuccessMsg('Class updated!');
    } else {
      const { error } = await supabase.from('classes').insert(payload);
      setSaving(false);
      if (error) {
        setFormError('Could not add class. Please try again.');
        return;
      }
      setSuccessMsg('Class added!');
    }

    closeForm();
    await fetchClasses();
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('classes').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      setError('Could not delete class. Please try again.');
    } else {
      setSuccessMsg('Class deleted.');
      await fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-stone-800 to-stone-900 text-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-stone-300 text-xs">Manage class schedule</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-semibold text-stone-200 bg-stone-700/50 px-3 py-2 rounded-lg hover:bg-stone-700 active:scale-95 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Success banner */}
      {successMsg && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 bg-amber-400 text-stone-900 font-bold text-base py-3 rounded-xl hover:bg-amber-300 active:scale-[0.98] transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Class
        </button>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
            <p className="text-stone-500">Loading classes…</p>
          </div>
        ) : (
          <ScheduleView
            classes={classes}
            adminMode
            onEdit={openEdit}
            onDelete={(cls) => setDeleteTarget(cls)}
          />
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeForm}
          />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">
                {editingId ? 'Edit Class' : 'Add New Class'}
              </h2>
              <button
                onClick={closeForm}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                  Teacher
                </label>
                <select
                  value={form.teacher_name}
                  onChange={(e) => {
                    const teacher = e.target.value;
                    const subjectMap: Record<string, string> = {
                      Priya: 'Vocals',
                      Arjun: 'Keyboard',
                      Maya: 'Guitar',
                    };
                    setForm({ ...form, teacher_name: teacher, subject: subjectMap[teacher] ?? form.subject });
                  }}
                  required
                  className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select a teacher</option>
                  {TEACHERS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                  Subject
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                  Day
                </label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  required
                  className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                    className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                    className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                  Room
                </label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  required
                  placeholder="e.g., Studio A"
                  className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_capacity}
                    onChange={(e) => setForm({ ...form, max_capacity: e.target.value })}
                    required
                    className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                    Enrolled
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.current_enrollment}
                    onChange={(e) => setForm({ ...form, current_enrollment: e.target.value })}
                    className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-base hover:bg-stone-50 active:scale-[0.98] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-amber-400 text-stone-900 font-bold text-base hover:bg-amber-300 active:scale-[0.98] transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-1">Delete this class?</h3>
              <p className="text-sm text-stone-500 mb-5">
                {deleteTarget.subject} with {deleteTarget.teacher_name} on {deleteTarget.day} at {deleteTarget.start_time.slice(0, 5)}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button (mobile) */}
      <button
        onClick={openAdd}
        className="sm:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-amber-400 text-stone-900 shadow-lg flex items-center justify-center active:scale-90 transition"
        aria-label="Add class"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

import { Music, Users, MapPin, Clock } from 'lucide-react';
import type { ClassRow } from '@/lib/supabase';
import { DAYS } from '@/lib/supabase';

const subjectColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Vocals: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Keyboard: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Guitar: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${period}`;
}

type ScheduleViewProps = {
  classes: ClassRow[];
  adminMode?: boolean;
  onEdit?: (cls: ClassRow) => void;
  onDelete?: (cls: ClassRow) => void;
};

export default function ScheduleView({ classes, adminMode, onEdit, onDelete }: ScheduleViewProps) {
  const grouped = DAYS.map((day) => ({
    day,
    items: classes
      .filter((c) => c.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Music className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <p className="text-stone-500 text-lg">No classes scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map(({ day, items }) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-stone-800">{day}</h2>
            <span className="text-sm text-stone-400 font-medium">
              {items.length} {items.length === 1 ? 'class' : 'classes'}
            </span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="space-y-3">
            {items.map((cls) => {
              const colors = subjectColors[cls.subject] ?? subjectColors.Vocals;
              const isFull = cls.current_enrollment >= cls.max_capacity;
              return (
                <div
                  key={cls.id}
                  className={`relative rounded-2xl border-2 p-4 transition-all ${colors.bg} ${colors.border}`}
                >
                  {isFull && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      FULL
                    </span>
                  )}
                  <div className="flex items-start gap-3 pr-16">
                    <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${colors.dot}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-stone-900 leading-snug">
                        {cls.subject}
                      </h3>
                      <p className="text-sm text-stone-600 font-medium mt-0.5">
                        {cls.teacher_name}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {cls.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          {cls.current_enrollment}/{cls.max_capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                  {adminMode && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-stone-200/60">
                      <button
                        onClick={() => onEdit?.(cls)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 active:scale-95 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete?.(cls)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 active:scale-95 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

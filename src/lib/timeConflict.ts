import type { ClassRow } from './supabase';

/**
 * Checks if two time ranges overlap.
 * Two ranges [startA, endA) and [startB, endB) overlap if:
 * startA < endB AND startB < endA
 */
export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Finds a conflicting class for the given teacher on the given day
 * with an overlapping time range. Excludes the class with `excludeId`
 * (used when editing, so the class doesn't conflict with itself).
 */
export function findConflict(
  classes: ClassRow[],
  teacherName: string,
  day: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): ClassRow | null {
  return (
    classes.find(
      (c) =>
        c.id !== excludeId &&
        c.teacher_name === teacherName &&
        c.day === day &&
        timesOverlap(c.start_time, c.end_time, startTime, endTime)
    ) ?? null
  );
}

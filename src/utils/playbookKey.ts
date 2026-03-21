/** Stable key for remedial playbook analytics (from lesson title). */
export function playbookKeyFromLessonTitle(title: string | undefined | null): string {
  const t = (title ?? '').trim().toLowerCase();
  if (!t) return 'unnamed-playbook';
  const slug = t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
  return slug || 'unnamed-playbook';
}

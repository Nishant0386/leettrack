// apps/web/src/components/student/BadgeGrid.tsx
interface Badge {
  id: string;
  label: string;
  icon: string;
  desc: string;
  earned: boolean;
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`rounded-xl p-4 text-center border transition ${
            badge.earned
              ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
              : 'border-gray-100 dark:border-gray-800 opacity-40 grayscale'
          }`}
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{badge.label}</div>
          <div className="text-xs text-gray-400 mt-1">{badge.desc}</div>
        </div>
      ))}
    </div>
  );
}

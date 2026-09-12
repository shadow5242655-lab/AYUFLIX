'use client';

const fmtMoney = (n) =>
  n && n > 0 ? `$${n.toLocaleString('en-US')}` : '—';

export default function TitleFacts({ details, type }) {
  if (!details) return null;

  const facts = [];
  if (details.tagline) {
    facts.push({ label: 'Tagline', value: details.tagline });
  }
  if (type === 'movie') {
    facts.push({ label: 'Status', value: details.status || '—' });
    facts.push({ label: 'Budget', value: fmtMoney(details.budget) });
    facts.push({ label: 'Revenue', value: fmtMoney(details.revenue) });
  } else {
    facts.push({ label: 'Status', value: details.status || '—' });
    facts.push({
      label: 'Networks',
      value: (details.networks || []).map((n) => n.name).join(', ') || '—',
    });
    facts.push({
      label: 'Episode runtime',
      value: details.episode_run_time?.length ? `${details.episode_run_time[0]} min` : '—',
    });
  }
  facts.push({
    label: 'Studios',
    value:
      (details.production_companies || [])
        .slice(0, 3)
        .map((c) => c.name)
        .join(', ') || '—',
  });
  facts.push({
    label: 'Language',
    value: (details.spoken_languages || [])[0]?.english_name || '—',
  });

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-white mb-4">Details</h2>
      {details.tagline && (
        <p className="text-gray-400 italic text-sm mb-4 border-l-2 border-red-600 pl-3">&ldquo;{details.tagline}&rdquo;</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {facts
          .filter((f) => f.value !== '—')
          .map((f) => (
            <div key={f.label} className="bg-gray-900/50 border border-gray-800/70 rounded-lg px-3 py-2.5">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{f.label}</p>
              <p className="text-white text-sm mt-0.5 truncate" title={f.value}>
                {f.value}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

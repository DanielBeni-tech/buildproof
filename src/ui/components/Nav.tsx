const ITEMS = [
  { key: 'requirements', label: 'Exigences' },
  { key: 'scenarios', label: 'Scénarios' },
  { key: 'runs', label: 'Exécutions' },
  { key: 'report', label: 'Rapport' },
];

interface Props {
  active: string;
  onSelect: (key: string) => void;
}

export default function Nav({ active, onSelect }: Props) {
  return (
    <nav>
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${active === item.key ? 'active' : ''}`}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </div>
      ))}
    </nav>
  );
}
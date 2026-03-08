interface TechTagProps {
  label: string;
}

export default function TechTag({ label }: TechTagProps) {
  return (
    <span className="bg-light-lavender text-taupe font-mono text-xs px-2 py-0.5 rounded">
      {label}
    </span>
  );
}

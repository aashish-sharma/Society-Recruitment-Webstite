export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-ink-muted">
        <p>&copy;  Built by Aashish Sharma</p>
      </div>
    </footer>
  );
}

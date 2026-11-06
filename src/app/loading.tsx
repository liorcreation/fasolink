export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Chargement de FasoLink" className="container-faso py-10 sm:py-14">
      <div role="status" className="mx-auto max-w-6xl">
        <span className="sr-only">Chargement de la page…</span>
        <div className="h-6 w-36 rounded-full bg-clay-200/70" />
        <div className="mt-5 h-12 w-3/4 max-w-2xl rounded-2xl bg-clay-200/70 sm:h-16" />
        <div className="mt-4 h-5 w-full max-w-xl rounded-lg bg-clay-100" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-[1.75rem] border border-clay-200/70 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] rounded-2xl bg-clay-100" />
              <div className="mt-5 h-5 w-2/3 rounded-lg bg-clay-200/70" />
              <div className="mt-3 h-4 w-full rounded-lg bg-clay-100" />
              <div className="mt-5 h-11 rounded-full bg-clay-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

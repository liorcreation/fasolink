export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Chargement de FasoLink" className="container-faso py-10 sm:py-14">
      <div role="status" className="mx-auto max-w-6xl">
        <span className="sr-only">Chargement de la page…</span>
        <span aria-hidden="true" className="faso-brand-thread fx-loading-thread mb-8 block w-40 rounded-full" />
        <div className="fx-skeleton h-7 w-40 rounded-full" />
        <div className="fx-skeleton mt-5 h-12 w-3/4 max-w-2xl rounded-2xl sm:h-16" />
        <div className="fx-skeleton mt-4 h-5 w-full max-w-xl rounded-lg" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-[1.6rem] border border-clay-100 bg-white/90 p-2 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)]">
              <div className="fx-skeleton aspect-[4/3] rounded-[1.25rem]" />
              <div className="p-2">
                <div className="fx-skeleton mt-3 h-5 w-2/3 rounded-lg" />
                <div className="fx-skeleton mt-3 h-4 w-full rounded-lg" />
                <div className="fx-skeleton mt-5 h-11 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 md:px-12 lg:px-16 pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8 bg-secondary-7">
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 mb-8 sm:mb-10 md:mb-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
            <img src="/img/logo/logo-sin-texto-png.png" alt="ZenTrip" className="h-8 sm:h-9 md:h-10 w-auto" />
            <span className="text-lg sm:text-xl font-extrabold">
              <span className="text-white">Zen</span>
              <span className="text-primary-3">Trip</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-secondary-2">
            Plan, Pack & Go. El planificador de viajes que tu grupo necesitaba.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 md:flex-1 md:flex md:justify-end md:gap-12 lg:gap-16">
          {[
            { title: "Producto", links: ["Funcionalidades", "Precios", "Comunidad", "Novedades"] },
            { title: "Empresa", links: ["Sobre nosotros", "Blog", "Contacto"] },
            { title: "Legal", links: ["Privacidad", "Términos de uso", "Cookies"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2.5 sm:mb-4 text-secondary-2">
                {col.title}
              </h4>
              {col.links.map(l => (
                <a key={l} className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2.5 cursor-pointer transition-colors text-secondary-3"
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "var(--color-secondary-3)"}
                >{l}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-5 sm:pt-7 border-t border-secondary-6">
        <span className="text-xs sm:text-sm font-medium text-secondary-3 text-center sm:text-left">
          © 2026 ZenTrip. Hecho con ❤️ para viajeros.
        </span>

      </div>
    </footer>
  );
}

/** Bouton « Exporter en CSV » au-dessus de la liste des demandes (ouvrable dans Excel). */
export function BookingsExport() {
  return (
    <div className="wp-export">
      <a className="wp-btn" href="/api/bookings/export" download>
        Exporter en CSV (Excel)
      </a>
      <span className="wp-muted">Toutes les demandes, avec leur statut et le créneau confirmé.</span>
    </div>
  );
}

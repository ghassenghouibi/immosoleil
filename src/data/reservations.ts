/**
 * ============================================================
 *  CALENDRIER DES LOCATIONS VACANCES — DATES DÉJÀ RÉSERVÉES
 * ============================================================
 *
 *  Quand une réservation est confirmée (sur WhatsApp, par téléphone, Airbnb…),
 *  ajoutez-la ici pour bloquer les dates sur le site.
 *
 *  - La clé est le slug de la villa (fin de son adresse sur le site,
 *    ex. /sejour/villa-ilef → 'villa-ilef').
 *  - Chaque période = [arrivée, départ] au format 'AAAA-MM-JJ'.
 *    Le jour du départ reste libre pour une nouvelle arrivée, comme sur Airbnb.
 *
 *  Exemple :
 *    'villa-ilef': [
 *      ['2027-07-03', '2027-07-10'],
 *      ['2027-08-01', '2027-08-15'],
 *    ],
 */
export const RESERVATIONS: Record<string, [string, string][]> = {
}

/** Nombre minimum de nuits pour une demande de réservation */
export const MIN_NUITS = 2

/** Délai minimum avant l'arrivée (en jours) : 0 = on peut réserver pour ce soir */
export const DELAI_ARRIVEE_JOURS = 1

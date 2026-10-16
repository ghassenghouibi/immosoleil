/** Photos de Djerba utilisées sur le site (Wikimedia Commons). Les licences CC BY / BY-SA imposent de citer l'auteur. */
export interface Credit {
  fichier: string
  titre: string
  auteur: string
  licence: string
  licenceUrl?: string
  source: string
}

export const CREDITS: Credit[] = [
  { fichier: "src/assets/djerba/plage.jpg", titre: "Djerba plage.jpg", auteur: "Khemirasameh", licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Djerba_plage.jpg" },
  { fichier: "src/assets/djerba/plage-2.jpg", titre: "Djerba beach-kleche.jpg", auteur: "Philippe HECKEL from France", licence: "CC BY 2.0", licenceUrl: "https://creativecommons.org/licenses/by/2.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Djerba_beach-kleche.jpg" },
  { fichier: "src/assets/djerba/plage-3.jpg", titre: "Djerba beach-katinalynn.jpg", auteur: "Katina Rogers", licence: "CC BY 2.0", licenceUrl: "https://creativecommons.org/licenses/by/2.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Djerba_beach-katinalynn.jpg" },
  { fichier: "src/assets/djerba/houch.jpg", titre: "OLD HOUCH - DJERBA.jpg", auteur: "Meryem ATHIMNI", licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:OLD_HOUCH_-_DJERBA.jpg" },
  { fichier: "src/assets/djerba/houch-cour.jpg", titre: "Houch à Djerba.jpg", auteur: "Youssefbhy", licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Houch_à_Djerba.jpg" },
  { fichier: "src/assets/djerba/houmt-souk.jpg", titre: "Houmt el souk.jpg", auteur: "Synek125", licence: "CC BY 3.0", licenceUrl: "https://creativecommons.org/licenses/by/3.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Houmt_el_souk.jpg" },
  { fichier: "src/assets/djerba/marche.jpg", titre: "Djerba - Market in Houmt Souk.jpg", auteur: "Auteur inconnu", licence: "Public domain", licenceUrl: undefined, source: "https://commons.wikimedia.org/wiki/File:Djerba_-_Market_in_Houmt_Souk.jpg" },
  { fichier: "src/assets/djerba/port.jpg", titre: "Port de Houmt Souk-05-phileole.jpg", auteur: "phileole", licence: "CC BY 2.0", licenceUrl: "https://creativecommons.org/licenses/by/2.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Port_de_Houmt_Souk-05-phileole.jpg" },
  { fichier: "src/assets/djerba/flamants.jpg", titre: "Un groupe de flamants roses à Guellala - Djerba.jpg", auteur: "Skander zarrad", licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Un_groupe_de_flamants_roses_à_Guellala_-_Djerba.jpg" },
  { fichier: "src/assets/djerba/poterie.jpg", titre: "Potier de Guellala à l'entrée de son atelier.jpg", auteur: "Eyakaddour", licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr", source: "https://commons.wikimedia.org/wiki/File:Potier_de_Guellala_%C3%A0_l%27entr%C3%A9e_de_son_atelier.jpg" },
]

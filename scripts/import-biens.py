#!/usr/bin/env python3
"""
Convertit l'export WordPress d'immosoleildjerba.com (biens_immosoleildjerba.json)
en deux fichiers utilisés par le site :

  src/data/annonces.json  →  ventes + locations à l'année (pages /acheter, /louer, /bien/:id)
  src/data/sejours.json   →  locations vacances réservables (pages /locations-vacances, /sejour/:slug)

Usage :  python3 scripts/import-biens.py [chemin/vers/biens_immosoleildjerba.json]

Le texte des fiches est nettoyé (emojis, calendrier WordPress, lignes collées),
découpé en sections, et les infos clés sont extraites : voyageurs, chambres,
surfaces, quartier, grille de tarifs par saison, équipements.
Quand l'extraction automatique se trompe, corrigez le bien dans OVERRIDES.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'biens_immosoleildjerba.json'

# Corrections manuelles, par id WordPress
OVERRIDES: dict[int, dict] = {
    3733: {'chambres': 3, 'suites': 2},  # « 3 chambres · 2 suites parentales » : les suites sont comprises dans les 3 chambres
    3901: {'transaction': 'Location', 'prix': 4000, 'periode': 'Location longue durée (octobre à décembre)'},
    3340: {'surface_habitable_m2': 700, 'surface_terrain_m2': 9200},
    3507: {'localite': 'Midoun'},
    3647: {'chambres': 3, 'suites': 1},  # suite parentale + 2 chambres, par villa
    3248: {'chambres': 3, 'suites': 1},
    2675: {'prix_unite': 'm2'},
}

PLACES = [
    ('entre midoun et houmt souk', 'Midoun – Houmt Souk'),
    ('houmt souk', 'Houmt Souk'), ('houmt el souk', 'Houmt Souk'),
    ('midoun', 'Midoun'), ('tezdaine', 'Tezdaine'), ('tezdiane', 'Tezdaine'),
    ('chbabya', 'Chbabya'), ('beni maaguel', 'Beni Maaguel'), ('lagune', 'La Lagune'),
    ('sidi jmour', 'Sidi Jmour'), ('khazroun', 'Khazroun'), ('mguersaa', 'Midoun'),
    ('aghir', 'Aghir'), ('mezraya', 'Mezraya'), ('erriadh', 'Erriadh'), ('guellala', 'Guellala'),
    ('ajim', 'Ajim'), ('borgo mall', 'Midoun'), ('tlella', 'Midoun'),
]

MONTHS = {
    'janvier': 1, 'février': 2, 'fevrier': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
    'juillet': 7, 'août': 8, 'aout': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12, 'decembre': 12,
}
WORD_NUM = {'une': 1, 'un': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6}

HEADINGS = {
    'description', 'composition intérieure', 'composition', 'à l’extérieur', "à l'extérieur", 'extérieur',
    'extérieur & détente', 'extérieurs et potentiel', 'points forts', 'les points forts', 'équipements', 'equipements',
    'equipement', 'équipement', 'emplacement', 'un emplacement stratégique', 'capacité & séjour', 'règles de la villa',
    'infos pratiques', 'couchages', 'espaces de vie', 'caractéristiques', 'caractéristiques du bien', 'informations',
    'informations juridiques', 'location longue durée', 'stationnement', 'contact & réservation', 'tarifs de location',
    'à l’étage', 'le local comprend', 'la villa se compose de', 'la villa principale comprend', 'elle se compose de',
}
DROP_SECTIONS = {'contact & réservation', 'tarifs de location', 'description', 'informations'}
EQUIP_SECTIONS = {'équipements', 'equipements', 'equipement', 'équipement'}

LOWER = 'a-zàâäçéèêëîïôöûùüÿœ'
UPPER = 'A-ZÀÂÄÇÉÈÊËÎÏÔÖÛÙÜŸŒ'


def strip_bullet(s: str) -> str:
    """Retire emojis, puces et ponctuation de tête/fin : '🏊‍♀️ Piscine privée' → 'Piscine privée'."""
    s = re.sub(r'^[^\w(«»"“0-9]+', '', s, flags=re.UNICODE)
    s = re.sub(r'[\s‍️]+$', '', s)
    return s.strip(' »«').strip()


def clean_lines(text: str) -> list[str]:
    text = text.replace('DisponibleRéservéPassage', '')  # légende du calendrier WordPress
    text = text.replace('\r', '').replace('h2>', '').replace('✅', '\n').replace('•', '\n')
    # lignes collées par l'export : « espace repasUne cuisine », « (four…)3 suites »
    text = re.sub(rf'(?<=[{LOWER}…)])(?=[{UPPER}][{LOWER}])', '\n', text)
    text = re.sub(r'(?<=[…)])(?=\d)', '\n', text)
    text = re.sub(rf'(?<=[{LOWER}]):(?=[{UPPER}])', ':\n', text)       # « Composition intérieure :Un salon »
    text = re.sub(rf'(?<=\S) :(?=[{UPPER}])', ' :\n', text)
    text = re.sub(rf'(?<=[{LOWER}]{{3}})(?=\d)', '\n', text)              # « suite parentale3 chambres »
    out = []
    for raw in text.split('\n'):
        line = raw.strip()
        if not line:
            continue
        # calendrier « WP Simple Booking Calendar » embarqué dans certaines descriptions
        if '{' in line or 'DisponibleRéservé' in line or re.fullmatch(r'[LMJVSD]|\d{1,2}', line):
            continue
        if re.fullmatch(rf'({"|".join(MONTHS)}) \d{{4}}', line, flags=re.I):
            continue
        if re.match(r'https?://', line) or line.startswith('Localisation') or line == 'Ajoutez votre titre ici':
            continue
        out.append(line)
    return out


def is_contact(line: str) -> bool:
    return bool(re.search(r'(?i)contactez|\+216|whatsapp|réservez directement|pour plus d.informations|📞|organiser une visite', line))


def find_place(*texts: str) -> str:
    for t in texts:
        low = (t or '').lower()
        for key, name in PLACES:
            if key in low:
                return name
    return 'Djerba'


def num(s: str) -> int:
    return int(re.sub(r'\D', '', s))


def count_rooms(text: str) -> tuple[int | None, int | None]:
    """(chambres au total, dont suites) d'après « 1 suite parentale · 2 chambres », « Deux chambres », « S+3 »…"""
    n = r'(\d+|une|un|deux|trois|quatre|cinq|six)'
    m_ch = re.search(rf'(?i)\b{n}\s+chambres?\b', text)
    m_su = re.search(rf'(?i)\b{n}\s+suites?\b', text)
    to_int = lambda m: int(m.group(1)) if m.group(1).isdigit() else WORD_NUM[m.group(1).lower()]
    ch = to_int(m_ch) if m_ch else None
    su = to_int(m_su) if m_su else None
    if ch is None and su is None:
        if re.search(r'(?i)une suite parentale', text):
            su = 1
        m = re.search(r'\bS\+(\d)', text)
        if m:
            return int(m.group(1)), su
        return (su, su) if su else (None, None)
    if m_ch and re.search(r'(?i)chambres? dont', text[m_ch.start():m_ch.end() + 10]):
        return ch, su
    return (ch or 0) + (su or 0), su


def surfaces(text: str) -> tuple[int | None, int | None]:
    hab = terr = None
    for pat in [r'(\d[\d ]{0,5}) *m² *(?:habitables|couverts|bâtis)', r'surface (?:habitable|bâtie|couverte) *(?:de|:)? *(\d[\d ]{0,5}) *m²',
                r'propriété de (\d[\d ]{0,5}) *m²', r'Surface *: *(\d[\d ]{0,5}) *m²']:
        m = re.search(pat, text, flags=re.I)
        if m:
            hab = num(m.group(1)); break
    for pat in [r'terrain *(?:de|:)? *(\d[\d ]{0,5}) *m²', r'(\d[\d ]{0,5}) *m² *de terrain', r'surface du terrain *: *(\d[\d ]{0,5}) *m²']:
        m = re.search(pat, text, flags=re.I)
        if m:
            terr = num(m.group(1)); break
    return hab, terr


def parse_tarifs(lines: list[str]) -> list[dict]:
    """Tableau « Période / Prix (DT) / Juin / 300 DT / Juillet & Août / 450 DT … »"""
    try:
        i = next(k for k, l in enumerate(lines) if l.startswith('Prix (DT)'))
    except StopIteration:
        return []
    out, k = [], i + 1
    while k + 1 < len(lines):
        label, price = lines[k], lines[k + 1]
        m = re.fullmatch(r'(\d[\d\s.]*)\s*DT', price)
        if not m:
            break
        mois = [MONTHS[w.lower()] for w in re.findall(r'[A-Za-zÀ-ÿ]+', label) if w.lower() in MONTHS]
        r = re.search(r'\((\d+)\s*[–-]\s*(\d+)\)', label)
        t = {'label': label, 'mois': mois, 'prix': num(m.group(1))}
        if r:
            t['du'], t['au'] = int(r.group(1)), int(r.group(2))
        out.append(t)
        k += 2
    return out


def sections_of(lines: list[str], nom: str) -> tuple[list[dict], list[str]]:
    """Découpe la description en sections {titre, texte[], liste[]} + renvoie la liste d'équipements."""
    secs: list[dict] = [{'titre': None, 'texte': [], 'liste': []}]
    equip: list[str] = []
    cur_key = ''
    seen = set()
    skip_table = False
    base = nom.split('–')[0].strip().lower()
    for line in lines:
        if ' · ' in line and re.search(r'voyageurs|chambre|m²|Location annuelle', line):
            continue  # ligne résumé « 8 voyageurs · 4 chambres · … » : déjà extraite
        head = re.sub(r'\s*:\s*$', '', strip_bullet(line))
        inline = re.match(r'^(Description)\s*:\s*(.+)$', line)
        if inline:
            line = inline.group(2)
            head = ''
        key = head.lower()
        if key in HEADINGS or (line.rstrip().endswith(':') and len(line) < 60):
            cur_key = key
            skip_table = key == 'tarifs de location'
            if key not in DROP_SECTIONS and key not in EQUIP_SECTIONS:
                secs.append({'titre': head, 'texte': [], 'liste': []})
            continue
        if skip_table and (line in ('Période', 'Mois', 'Prix (DT)') or re.fullmatch(r'\d[\d\s.]*\s*DT', line) or re.search('|'.join(MONTHS), line, re.I)):
            continue
        skip_table = False
        if cur_key in ('contact & réservation',) or is_contact(line):
            continue
        if line.startswith('📍') and len(secs) == 1:
            continue
        s = strip_bullet(line)
        if not s or s.lower() in seen:
            continue
        low = s.lower()
        if low == base or low.startswith(base + ' –') or low.startswith(base + ' -') or low.startswith('villa à vendre avec piscine à'):
            continue
        if re.match(r'(?i)^(prix|tarif|loyer)\s*:|^tarif à partir|^disponible à partir|^location saisonnière à partir', s):
            continue
        seen.add(low)
        if cur_key in EQUIP_SECTIONS:
            equip.append(s)
            continue
        target = secs[-1]
        (target['texte'] if (len(s) > 90 or s.endswith('.')) else target['liste']).append(s)
    return [x for x in secs if x['texte'] or x['liste']], equip


def summary_items(desc_lines: list[str], points: list[str]) -> list[str]:
    if points:
        return points
    for l in desc_lines[:4]:
        if ' · ' in l:
            return [p.strip() for p in l.split('·') if p.strip()]
    return []


def photos_of(b: dict) -> list[str]:
    out = []
    for p in b['photos']:
        u = p['url']
        if 'wikimedia.org' in u or u in out:
            continue
        out.append(u)
    return out


def main() -> None:
    data = json.loads(SRC.read_text())
    annonces, sejours = [], []
    for b in data['biens']:
        cats = [c.replace('&amp;', '&') for c in b['categories']]
        ov = OVERRIDES.get(b['id'], {})
        lines = clean_lines(b['description'])
        resume_lines = clean_lines(b['resume'])
        full = '\n'.join(lines + resume_lines)
        items = summary_items(lines, b['points_cles'])
        lieu_line = next((strip_bullet(l) for l in lines if l.startswith('📍')), '')
        localite = ov.get('localite') or find_place(b['nom'], lieu_line, b['resume'], b['description'])
        secs, equip = sections_of(lines if len(lines) > 3 else resume_lines, b['nom'])
        ch, su = count_rooms(' · '.join(items) if items else full)
        if ch is None:
            ch, su = count_rooms(full)
        ch, su = ov.get('chambres', ch), ov.get('suites', su)
        accroche = ' '.join(l for l in resume_lines if len(l) > 60 and not is_contact(l) and not re.match(r'(?i)^(📌|💰)', l))[:400]
        videos = list(dict.fromkeys(v for vs in [b['videos']] for v in (vs if isinstance(vs, list) else [vs]) if v))
        common = {
            'id': str(b['id']), 'slug': b['slug'], 'nom': b['nom'].strip(), 'url': b['url'],
            'localite': localite, 'lieu': lieu_line.replace(', Djerba – Tunisie', ', Djerba') or (f'{localite}, Djerba' if localite != 'Djerba' else 'Djerba'),
            'accroche': accroche, 'points_cles': items, 'sections': secs, 'equipements': equip,
            'photos': photos_of(b), 'videos': videos, 'chambres': ch, 'suites': su,
        }

        if 'Location Vacances' in cats:
            m_voy = re.search(r'(\d+)(?:\s*à\s*(\d+))?\s*voyageurs', full)
            voy = int(m_voy.group(2) or m_voy.group(1)) if m_voy else None
            if voy is None:
                m_cap = re.search(r'jusqu.à (\d+) personnes|Capacité maximale\s*:\s*(\d+)', full)
                voy = int(next(g for g in m_cap.groups() if g)) if m_cap else None
            tarifs = parse_tarifs(lines)
            sejours.append({**common, 'voyageurs': voy, 'tarifs': tarifs,
                            'prix_nuit': b['prix']['montant'] if not ('Location Annuelle' in cats) else None,
                            'piscine': bool(re.search(r'(?i)piscine', full)),
                            'jacuzzi': bool(re.search(r'(?i)jacuzzi', full)),
                            'plage_km': (lambda m: float(m.group(1).replace(',', '.')) if m else None)(re.search(r'(\d+(?:[.,]\d)?)\s*km de(?:s)? plage', full))})
            # Villa Zina est aussi louée à l'année : elle reste visible dans /louer
            if 'Location Annuelle' not in cats:
                continue

        transaction = ov.get('transaction') or ('Vente' if 'Vente' in cats else 'Location')
        if 'Terrains' in cats:
            type_bien = 'Terrain'
        elif any(c.startswith('Locaux') for c in cats):
            type_bien = 'Bureau et local... | Fonds de commerce'
        else:
            type_bien = 'Maison / Villa'
        rubriques = ['acheter'] if transaction == 'Vente' else ['louer']
        if type_bien.startswith('Bureau'):
            rubriques.append('bureaux-et-commerces')
        hab, terr = surfaces(full)
        hab, terr = ov.get('surface_habitable_m2', hab), ov.get('surface_terrain_m2', terr)
        prix = ov.get('prix', b['prix']['min'] or b['prix']['montant'])
        if prix is None and transaction == 'Location':
            m = re.search(r'(\d[\d\s]*)\s*DT\s*/\s*mois', full)
            prix = num(m.group(1)) if m else None
        autres = {'Quartier': localite}
        if re.search(r'(?i)titre bleu', full):
            autres['Titre'] = 'Titre bleu'
        m = re.search(r'(?i)frais d.agence\s*:\s*([\d,.]+\s*%)', full)
        if m:
            autres["Frais d'agence"] = m.group(1)
        if b['prix']['max'] and b['prix']['max'] != prix:
            autres['Prix'] = f"{prix:,} à {b['prix']['max']:,} DT".replace(',', ' ')
        if ov.get('periode'):
            autres['Période'] = ov['periode']
        elif 'Location Annuelle' in cats:
            autres['Période'] = "Location à l'année"
        if re.search(r'(?i)meublée?', ' '.join(cats) + full):
            autres['Ameublement'] = 'Meublé'
        description = ' '.join(t for s in secs for t in s['texte']) or accroche
        annonces.append({
            'id': str(b['id']), 'reference': f"ISD{b['id']}", 'titre': b['nom'].strip(), 'transaction': transaction,
            'disponibilite': 'disponible' if b['disponible'] else 'vendu', 'type_bien': type_bien,
            'prix': prix, 'prix_unite': ov.get('prix_unite'), 'devise': 'TND', 'prix_texte': b['prix']['affichage'],
            'surface_habitable_m2': hab, 'surface_terrain_m2': terr, 'surface_m2': hab or terr,
            'chambres': ch, 'suites': su, 'sdb': None,
            'pays': 'Tunisie', 'gouvernorat': 'Djerba', 'delegation': localite, 'localite': localite,
            'adresse_complete': f'{localite}, Djerba, Tunisie' if localite != 'Djerba' else 'Djerba, Tunisie',
            'description': description, 'sections': secs, 'points_cles': items,
            'agence': 'Immo Soleil Djerba', 'telephones': [], 'rubriques': rubriques,
            'photos': common['photos'], 'nb_photos': len(common['photos']), 'videos': videos, 'url': b['url'],
            'autres_champs': autres, 'statut_annonce': None,
        })

    meta = {'source': data.get('source'), 'date_extraction': data.get('date_extraction')}
    (ROOT / 'src/data/annonces.json').write_text(json.dumps({**meta, 'nb_annonces': len(annonces), 'annonces': annonces}, ensure_ascii=False, indent=1))
    (ROOT / 'src/data/sejours.json').write_text(json.dumps({**meta, 'nb_sejours': len(sejours), 'sejours': sejours}, ensure_ascii=False, indent=1))
    print(f'{len(annonces)} annonces (vente / location à l\'année) · {len(sejours)} locations vacances')


if __name__ == '__main__':
    main()

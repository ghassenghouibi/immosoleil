#!/usr/bin/env python3
"""
Génère src/data/proximite.json : commerces, écoles, santé, transports et
loisirs autour de chaque localité des annonces, à partir d'OpenStreetMap.

  python3 scripts/build-proximite.py

1. Géocode chaque localité avec Nominatim (1 requête / seconde, règle OSM).
2. Interroge Overpass dans un rayon de RADIUS mètres.
3. Garde les lieux nommés les plus proches par catégorie.

À relancer quand de nouvelles localités apparaissent dans annonces.json.
"""
import json
import math
import signal
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ANNONCES = ROOT / 'src/data/annonces.json'
SEJOURS = ROOT / 'src/data/sejours.json'
OUT = ROOT / 'src/data/proximite.json'
UA = 'immosoleildjerba-web/1.0 (build script)'
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
RADIUS = 3000
PER_CATEGORY = 4

CATEGORIES = {
    'commerces': [('shop', 'supermarket|mall|convenience|bakery|department_store'), ('amenity', 'marketplace')],
    'ecoles': [('amenity', 'school|kindergarten|university|college')],
    'sante': [('amenity', 'pharmacy|hospital|clinic|doctors|dentist')],
    'transports': [('railway', 'station|halt|tram_stop'), ('public_transport', 'station'), ('amenity', 'bus_station')],
    'hotels': [('tourism', 'hotel|resort|guest_house|apartment')],
    'loisirs': [('leisure', 'park|sports_centre|fitness_centre'), ('natural', 'beach'), ('amenity', 'restaurant|cafe')],
}

KIND_LABEL = {
    'supermarket': 'Supermarché', 'mall': 'Centre commercial', 'convenience': 'Épicerie', 'bakery': 'Boulangerie',
    'department_store': 'Grand magasin', 'marketplace': 'Marché', 'school': 'École', 'kindergarten': 'Jardin d\'enfants',
    'university': 'Université', 'college': 'Lycée / Institut', 'pharmacy': 'Pharmacie', 'hospital': 'Hôpital',
    'clinic': 'Clinique', 'doctors': 'Cabinet médical', 'dentist': 'Dentiste', 'station': 'Gare', 'halt': 'Arrêt TGM / train',
    'tram_stop': 'Métro léger', 'bus_station': 'Gare routière', 'park': 'Parc', 'sports_centre': 'Complexe sportif',
    'fitness_centre': 'Salle de sport', 'beach': 'Plage', 'restaurant': 'Restaurant', 'cafe': 'Café',
    'hotel': 'Hôtel', 'resort': 'Club / resort', 'guest_house': "Maison d'hôtes", 'apartment': 'Résidence hôtelière',
}


def get(url: str, data: bytes | None = None) -> dict | list:
    req = urllib.request.Request(url, data=data, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.load(r)


def geocode(q: str) -> tuple[float, float] | None:
    time.sleep(1.1)
    res = get('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'json', 'limit': 1, 'countrycodes': 'tn'}))
    return (float(res[0]['lat']), float(res[0]['lon'])) if res else None


def dist(a: tuple[float, float], b: tuple[float, float]) -> int:
    la1, lo1, la2, lo2 = map(math.radians, (*a, *b))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return round(6371000 * 2 * math.asin(math.sqrt(h)))


def places_around(center: tuple[float, float]) -> dict:
    lat, lng = center
    parts = [f'nwr["{k}"~"^({v})$"]["name"](around:{RADIUS},{lat},{lng});' for rules in CATEGORIES.values() for k, v in rules]
    q = f'[out:json][timeout:60];({"".join(parts)});out center tags;'
    for attempt in range(4):
        try:
            els = get(OVERPASS[attempt % len(OVERPASS)], urllib.parse.urlencode({'data': q}).encode())['elements']
            break
        except Exception:
            time.sleep(3)
    else:
        return {}
    out: dict[str, list] = {}
    for cat, rules in CATEGORIES.items():
        found = {}
        for el in els:
            tags = el.get('tags', {})
            kind = next((tags[k] for k, v in rules if tags.get(k) in v.split('|')), None)
            if not kind:
                continue
            p = (el['lat'], el['lon']) if 'lat' in el else (el['center']['lat'], el['center']['lon'])
            name = tags.get('name:fr') or tags['name']
            d = dist(center, p)
            if name not in found or found[name]['m'] > d:
                found[name] = {'name': name, 'kind': KIND_LABEL.get(kind, kind), 'm': d}
        if found:
            out[cat] = sorted(found.values(), key=lambda x: x['m'])[:PER_CATEGORY]
    return out


def main() -> None:
    signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError()))
    annonces = json.loads(ANNONCES.read_text())['annonces']
    previous = json.loads(OUT.read_text()) if OUT.exists() else {}
    # « Djerba » seul = quartier non précisé : pas de point de référence fiable
    keys = {(a['localite'], a['delegation'], a['gouvernorat']) for a in annonces if a['localite'] != 'Djerba'}
    # Séjours : « Midoun – Houmt Souk » → on retient la première localité
    for s in json.loads(SEJOURS.read_text())['sejours']:
        loc = s['localite'].split(' – ')[0].strip()
        if loc != 'Djerba':
            keys.add((loc, loc, 'Médenine'))
    keys = sorted({(loc, deleg): gouv for loc, deleg, gouv in keys}.items())
    result = {}
    for i, ((loc, deleg), gouv) in enumerate(keys, 1):
        key = f'{loc}|{deleg}'
        if key in previous and previous[key].get('places'):
            result[key] = previous[key]
            continue
        signal.alarm(150)  # une requête réseau bloquée ne doit pas figer tout le script
        try:
            center = geocode(f'{loc}, Djerba, Médenine, Tunisie') or geocode(f'{loc}, Tunisie')
            precise = center is not None
            center = center or geocode('Djerba, Tunisie')
            if not center:
                print(f'[{i}/{len(keys)}] {key}: introuvable', flush=True)
                continue
            places = places_around(center)
        except TimeoutError:
            print(f'[{i}/{len(keys)}] {key}: délai dépassé', flush=True)
            continue
        finally:
            signal.alarm(0)
        result[key] = {'lat': round(center[0], 5), 'lng': round(center[1], 5), 'precise': precise, 'places': places}
        print(f'[{i}/{len(keys)}] {key}: {sum(len(v) for v in places.values())} lieux', flush=True)
        OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1))
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(f'→ {OUT.relative_to(ROOT)} ({len(result)} localités)')


if __name__ == '__main__':
    main()

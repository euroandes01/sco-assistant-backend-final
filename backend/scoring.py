# scoring.py - conservative SCO analysis + heuristics
import re

def analyze_sco(text: str, mode: str = 'free', icpo: str = '') -> dict:
    """
    Returns a dictionary with fields:
      - raw
      - header (website,email,phone,etc)
      - products: list
      - procedures: list
      - risk_score (0-100)
      - red_flags: list
      - recommendation: str
    """
    out = {
        "raw": text[:20000],
        "header": {},
        "products": [],
        "procedures": [],
        "red_flags": [],
        "risk_score": 0,
        "recommendation": ""
    }

    # header
    out['header']['website'] = _find_first(r'(https?://[^\s]+|www\.[^\s]+)', text)
    out['header']['email'] = _find_first(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    out['header']['phone'] = _find_first(r'\+?\d[\d\-\s\(\)]{6,}\d', text)
    out['header']['issue_date'] = _find_first(r'Issue Date:\s*(.+)', text, flags=re.I)
    out['header']['valid_till'] = _find_first(r'Valid Till:\s*(.+)', text, flags=re.I)

    # detect products blocks by product names & parse qty/price
    product_names = ['AVIATION KEROSENE','JET FUEL','LNG','ULTRA-LOW SULPHUR DIESEL','LIGHT CYCLE OIL','DIESEL GAS','LIQUIDIFIED PETROLEUM GAS','D6 VIRGIN FUEL OIL','GOLD','GOLD BULLION','BTC','BITCOIN','EN590']
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    for p in paragraphs:
        header_line = p.split('\n')[0].upper()
        if any(name in header_line for name in product_names):
            prod = {}
            prod['title'] = header_line
            prod['raw'] = p
            prod['min'] = _find_first(r'Minimum Quantity:\s*([0-9,.\sA-Za-z]+)', p, flags=re.I)
            prod['max'] = _find_first(r'Maximum Quantity:\s*([0-9,.\sA-Za-z]+)', p, flags=re.I)
            prod['fob'] = _find_first(r'FOB Price[:\s]*\$?([0-9\.,]+)', p, flags=re.I)
            prod['cif'] = _find_first(r'CIF Price[:\s]*\$?([0-9\.,]+)', p, flags=re.I)
            prod['net'] = _find_first(r'Net[:\s]*\$?([0-9\.,]+)', p, flags=re.I)
            prod['gross'] = _find_first(r'Gross[:\s]*\$?([0-9\.,]+)', p, flags=re.I)
            prod['commission'] = _find_first(r'Commission[:\s\S]*?\$([0-9\.,]+)', p, flags=re.I)
            out['products'].append(prod)

    # Procedures detection
    proc_matches = re.findall(r'(CIF TRANSACTION PROCEDURE[\s\S]*?)(?=OFFICIAL TRANSACTION PROCEDURES|$)', text, flags=re.I)
    if proc_matches:
        out['procedures'].extend(proc_matches)

    # red flag checks
    flags = []
    if not out['header'].get('email'):
        flags.append('Missing contact email')
    if not out['header'].get('phone'):
        flags.append('Missing contact phone')
    # unrealistic prices (very small heuristic)
    for p in out['products']:
        if p.get('fob'):
            try:
                val = float(p['fob'].replace(',',''))
                if val < 1.0:
                    flags.append(f'Unusually low FOB price for product "{p["title"]}"')
            except:
                pass
    # check for too-high volumes
    for p in out['products']:
        if p.get('max'):
            nums = re.sub(r'[^\d]', '', p['max'])
            if nums.isdigit():
                if len(nums) >= 6:
                    flags.append(f'High maximum quantity: {p["max"]}')

    # risk score heuristic: base 50, +10 per red flag up to 100; premium reduces 10 if premium and icpo provided
    risk = 50 + len(flags)*10
    if mode == 'premium' and icpo:
        risk = max(5, risk - 12)
    if risk > 100: risk = 100
    out['red_flags'] = flags
    out['risk_score'] = int(risk)
    if out['risk_score'] > 70:
        out['recommendation'] = 'High probability of non-legitimate SCO — perform thorough due diligence before sending any funds.'
    elif out['risk_score'] > 40:
        out['recommendation'] = 'Medium risk — verify POP, bank docs and check seller licenses.'
    else:
        out['recommendation'] = 'Low risk — proceed with normal commercial verification.'

    return out

def _find_first(pattern, text, flags=0):
    try:
        m = re.search(pattern, text, flags)
        if m:
            return m.group(1) if m.groups() else m.group(0)
    except:
        return None
    return None

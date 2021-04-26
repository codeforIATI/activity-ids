import re
import json
from pathlib import Path
from collections import defaultdict

import iatikit

output_path = Path('out', 'data')
maxlen = 500

def sanitize(text):
    return re.sub(r'[^\w\d-]', '_', text).upper()

iatikit.download.data()

keys = set()
for a in iatikit.data().activities:
    if not a.id:
        continue
    keys.add(a.id)

keylen = 1
done_dict = {}
while True:
    key_dict = defaultdict(list)
    for id_ in keys:
        sanitized_id = sanitize(id_)
        key_dict[sanitized_id[:keylen]].append(id_)
    keys = []
    for k, v in key_dict.items():
        if len(v) <= maxlen:
            done_dict[k] = sorted(v)
        else:
            keys += v
    if keys == []:
        break
    keylen += 1

del key_dict

for k, v in done_dict.items():
    for sub in (k[:i] for i in range(1, len(k))):
        p = Path(output_path, sub + '.json')
        if not p.exists():
            with open(p, 'w') as f:
                json.dump(True, f)
    with open(Path(output_path, k + '.json'), 'w') as f:
        json.dump(v, f)

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

import iatikit

output_path = Path('out', 'data')
keys_path = Path('out', '~all_keys.json')
maxlen = 500

def sanitize(text):
    return re.sub(r'[^\w\d-]', '_', text).upper()

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] != '--fast':
        with open(keys_path) as f:
            keys = json.load(f)
    else:
        iatikit.download.data()
        keys = set()
        for a in iatikit.data().activities:
            if not a.id:
                continue
            keys.add(a.id)
        keys = list(keys)
        with open(keys_path, 'w') as f:
            json.dump(keys, f)

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
                done_dict[k] = ('leaves', sorted(v))
            else:
                done_dict[k] = ('nodes', sorted({i[:keylen + 1]: None for i in v}.keys()))
                keys += v
        if keys == []:
            break
        keylen += 1

    del key_dict

    for k, v in done_dict.items():
        with open(Path(output_path, k + '.json'), 'w') as f:
            json.dump(v, f)

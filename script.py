import json
import re
import sys
from pathlib import Path
from collections import defaultdict

import iatikit

output_path = Path('out', 'data')
maxlen = 500

def sanitize(text):
    return re.sub(r'[^\w\d-]', '_', text).upper()

def write(filename, content):
    if filename == '':
        filename = '~'
    with open(Path(output_path, filename + '.json'), 'w') as f:
        json.dump(content, f)

if __name__ == '__main__':
    iatikit.download.data()
    keys = set()
    for a in iatikit.data().activities:
        if not a.id:
            continue
        keys.add(a.id)

    keys = [('', list(keys))]
    output = []
    while True:
        if keys == []:
            break
        k, v = keys.pop(0)
        if len(v) <= maxlen:
            # fewer than maxlen items, so this is a leaf
            write(k, ('l', sorted(v)))
        else:
            # we need to split this up
            keylen = len(k)
            nextkeylen = 1
            while True:
                nextv = defaultdict(list)
                for i in v:
                    nextk = sanitize(i[:keylen + nextkeylen])
                    nextv[nextk].append(i)
                if len(nextv) > 1:
                    break
                nextkeylen += 1
            keys = list(nextv.items()) + keys
            write(k, ('i', sorted(nextv)))

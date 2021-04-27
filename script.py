import json
import re
import sys
from pathlib import Path
from collections import defaultdict

import iatikit

output_path = Path('out', 'data')
maxlen = 500

def letters_first(x):
    return (not str.isalpha(x), x)

def sanitize(text):
    return re.sub(r'[^\w\d-]', '_', text).upper()

def write(filename, content):
    if filename == '':
        filename = 'empty'
    with open(Path(output_path, filename + '.json'), 'w') as f:
        json.dump(content, f)

if __name__ == '__main__':
    iatikit.download.data()
    keys = set()
    for a in iatikit.data().activities:
        if not a.id:
            continue
        keys.add(a.id)

    tosplit = [('', list(keys))]
    while True:
        if tosplit == []:
            break
        k, v = tosplit.pop(0)
        if len(v) <= maxlen:
            write(k, ('l', sorted(v, key=letters_first)))
        else:
            keylen = len(k)
            nextkeylen = 1
            while True:
                nextks = set()
                nextv = defaultdict(list)
                for i in v:
                    nextk = i[:keylen + nextkeylen]
                    nextks.add(nextk)
                    nextv[sanitize(nextk)].append(i)
                if len(nextv) > 1:
                    break
                nextkeylen += 1
            tosplit = list(nextv.items()) + tosplit
            write(k, ('i', sorted(list(nextks), key=letters_first)))

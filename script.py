import json
from pathlib import Path
from collections import defaultdict
import urllib.parse

import iatikit

output_path = Path('out')
maxlen = 500


def letters_first(x):
    return (not str.isalpha(x), x)


def sanitize(text):
    return urllib.parse.quote(text, safe='').upper()


def write(filename, content):
    if filename == '':
        filename = 'empty'
    with open(Path(output_path, 'data', filename + '.json'), 'w') as f:
        json.dump(content, f)


if __name__ == '__main__':
    iatikit.download.data()
    keys = set()
    for a in iatikit.data().activities:
        if not a.id:
            continue
        keys.add(a.id)

    # with open('~all_keys.json') as f:
    #     keys = json.load(f)

    tosplit = [('', list(keys))]
    while True:
        if tosplit == []:
            break
        k, v = tosplit.pop(0)
        count = len(v)
        if count <= maxlen:
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
            write(k, (count, sorted(list(nextks), key=letters_first)))

    for k in keys:
        k = urllib.parse.quote(k, safe='')
        try:
            with open(Path(output_path, 'api', k + '.json'), 'w') as f:
                json.dump(True, f)
        except OSError as exc:
            if exc.errno == 36:
                # long filename error. Skip it
                continue
            else:
                raise

import json

res = None
with open('ubc-2021W.json', 'r') as f:
    res = json.loads(f.read())

# nres = []
lst = []
for i in range(len(res)):
    section_types = []
    for j in res[i]['sections']:
        if j['type'] not in section_types:
            section_types.append(j['type'])
    if 'Distance Education' in section_types:
        lst.append((res[i]['id'], section_types))
    # if 'Lecture' in section_types and not section_types[0] == 'Lecture':
    #     lst.append((res[i]['id'], section_types))
    # nres.append(res[i])

# with open('ubc-2021W.json', 'w') as f:
#     f.write(json.dumps(nres))

print(lst)
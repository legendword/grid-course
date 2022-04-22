import json

res = None
with open('ubc-2021W.json', 'r') as f:
    res = json.loads(f.read())

'''
for i in range(len(res)):
    course_id = res[i]['subject'] + ' ' + res[i]['course']
    res[i]['id'] = course_id
    sections = []
    section_ids = {}
    for j in res[i]['sections']:
        section_id = course_id + ' ' + j['section']
        j['id'] = section_id
        if section_id in section_ids:
            continue
        section_ids[section_id] = True
        sections.append(j)
    res[i]['sections'] = sections
'''

nres = []
for i in range(len(res)):
    course_id = res[i]['id']
    sections = []
    for j in res[i]['sections']:
        section_id = j['id']

        # if (not j['days']) or (len(j['days']) == 1 and j['days'][0] == ''):
        #     continue

        # if (not j['start_time']) or j['start_time'] == '' or (not j['end_time']) or j['end_time'] == '':
        #     continue

        if j['type'] == 'Waiting List':
            continue
        
        sections.append(j)

    if len(sections) == 0:
        print('removed', course_id)
        continue
    elif not len(res[i]['sections']) == len(sections):
        print(course_id, len(res[i]['sections']), '->', len(sections))
    res[i]['sections'] = sections
    nres.append(res[i])

print(len(res), ' -> ', len(nres))

with open('ubc-2021W.json', 'w') as f:
    f.write(json.dumps(nres))

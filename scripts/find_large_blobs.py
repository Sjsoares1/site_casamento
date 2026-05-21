import subprocess
THRESHOLD = 10 * 1024 * 1024
p1 = subprocess.Popen(['git','rev-list','--objects','--all'], stdout=subprocess.PIPE)
p2 = subprocess.Popen(['git','cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize) %(rest)'], stdin=p1.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
out,err = p2.communicate()
if err:
    # stderr may contain warnings, ignore
    pass
for line in out.decode('utf-8',errors='ignore').splitlines():
    parts = line.split(' ',3)
    if len(parts) < 3:
        continue
    oid, otype, size = parts[0], parts[1], int(parts[2])
    rest = parts[3] if len(parts) > 3 else ''
    if otype == 'blob' and size > THRESHOLD:
        print(f"{oid} {size} {rest}")

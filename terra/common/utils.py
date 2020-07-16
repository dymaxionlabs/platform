import subprocess
from django.conf import settings


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def gsutilCopy(src, dst, recursive=True):
    r = "-r" if recursive else ""
    src = ["'{}'".format(s) for s in src.split(" ")]
    run_subprocess("{sdk_bin_path}/gsutil -m cp {r} {src} '{dst}'".format(
        sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
        r=r,
        src=' '.join(src),
        dst=dst))


def list_chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]
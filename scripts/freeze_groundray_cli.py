"""Freeze the current wheel and native engine without changing host credentials."""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

from build_standalone import require_current_package

import portable_kb


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--native', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    require_current_package(root, Path(portable_kb.__file__).resolve().parent)
    if args.output.exists() or args.output.is_symlink():
        parser.error('Use a new output directory; previous builds are preserved')
    native = args.native.absolute()
    if native.is_symlink() or not native.is_file():
        parser.error('Build the regular native search sidecar first')
    output = args.output.absolute()
    output.mkdir(parents=True)
    subprocess.run([sys.executable, '-m', 'PyInstaller', '--clean', '--noconfirm',
                    '--onefile', '--name', 'pkb', '--distpath', str(output / 'dist'),
                    '--workpath', str(output / 'work'), '--specpath', str(output / 'spec'),
                    '--add-binary', f'{native}{os.pathsep}.', '--collect-data', 'portable_kb',
                    '--copy-metadata', 'portable-kb-core', str(root / 'scripts/frozen_entrypoint.py')],
                   cwd=output, check=True)
    print(output / 'dist/pkb')


if __name__ == '__main__':
    main()

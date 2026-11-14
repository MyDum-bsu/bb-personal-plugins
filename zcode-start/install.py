#!/usr/bin/env python3
"""Install the tested ZCode Start Plan bridge without modifying ZCode itself."""
import json
import os
from pathlib import Path
import struct
import subprocess
import tempfile

HOME = Path.home()
OPT = HOME / '.local/opt'
IMAGE = Path(os.environ.get('ZCODE_APPIMAGE', OPT / 'ZCode.AppImage'))
ACP_VERSION = '0.84.3'
DESKTOP_VERSION = '3.18.2'
CLI_VERSION = '0.17.1'
ACP = OPT / ('bb-zcode-acp-start-' + ACP_VERSION)
DESKTOP = OPT / ('bb-zcode-desktop-' + DESKTOP_VERSION)
OLD = 'if (selection?.kind !== "start-plan")\n                continue;'
NEW = ('// Local BB setup: Start Plan can coexist with the remembered Coding Plan. '
       'The server decides entitlement.\n'
       '            if (selection?.kind !== "start-plan" && !(family === "zai" && '
       'selection?.kind === "individual-coding-plan"))\n                continue;')


def run(*args, **kw):
    return subprocess.run(args, check=True, **kw)


def desktop_version(offset):
    proc = subprocess.Popen(['unsquashfs', '-o', offset, '-cat', str(IMAGE),
                             'resources/app.asar'], stdout=subprocess.PIPE,
                            stderr=subprocess.DEVNULL)
    try:
        stream = proc.stdout
        pre = stream.read(16)
        size, length = struct.unpack_from('<I', pre, 4)[0], struct.unpack_from('<I', pre, 12)[0]
        if not 0 < length <= 16 * 1024 * 1024:
            raise RuntimeError('Invalid app.asar header')
        header = json.loads(stream.read(length))
        meta = header['files']['package.json']
        pos, target = 16 + length, 8 + size + int(meta['offset'])
        if target < pos or meta['size'] > 1024 * 1024:
            raise RuntimeError('Invalid app.asar package metadata')
        while pos < target:
            chunk = stream.read(min(1024 * 1024, target - pos))
            if not chunk:
                raise RuntimeError('Truncated app.asar')
            pos += len(chunk)
        return json.loads(stream.read(meta['size']))['version']
    finally:
        proc.terminate()
        proc.wait()


def main():
    OPT.mkdir(parents=True, exist_ok=True)
    offset = subprocess.check_output([str(IMAGE), '--appimage-offset'], text=True).strip()
    actual = desktop_version(offset)
    if actual != DESKTOP_VERSION:
        raise RuntimeError(f'Expected ZCode {DESKTOP_VERSION}, found {actual}; review compatibility before updating.')
    for target in (ACP, DESKTOP):
        if target.exists():
            raise RuntimeError(f'{target} already exists; leave the active installation intact.')

    with tempfile.TemporaryDirectory(prefix='bb-zcode-install-', dir=OPT) as temp:
        stage = Path(temp)
        bridge, desktop = stage / 'bridge', stage / 'desktop'
        run('npm', 'install', '--prefix', str(bridge), 'zcode-acp-server@' + ACP_VERSION,
            '--no-audit', '--no-fund')
        account = bridge / 'node_modules/zcode-acp-server/dist/config/account-provider.js'
        source = account.read_text()
        if source.count(OLD) != 1:
            raise RuntimeError('Adapter code changed; refusing to apply an unverified patch.')
        account.write_text(source.replace(OLD, NEW))
        run('unsquashfs', '-o', offset, '-d', str(desktop), str(IMAGE),
            'resources/glm/zcode.cjs', 'resources/config/provider/zcode-builtin.json')
        cli = desktop / 'resources/glm/zcode.cjs'
        version = subprocess.check_output(['node', str(cli), '--version'], text=True).strip()
        if version != CLI_VERSION:
            raise RuntimeError(f'Expected CLI {CLI_VERSION}, found {version}; refusing activation.')
        # Existing versioned installs are never overwritten while BB may use them.
        for source_dir, target in ((bridge, ACP), (desktop, DESKTOP)):
            source_dir.rename(target)

    config = json.loads(subprocess.check_output(['bb', 'plugin', 'config', 'provider-acp', '--json'], text=True))
    agents = json.loads(config['values']['customAgents'] or '[]')
    entry = next((agent for agent in agents if agent['id'] == 'zcode-start'), None)
    if entry is None:
        entry = {'id': 'zcode-start'}
        agents.append(entry)
    entry.update({'displayName': 'ZCode (Start Plan)',
                  'command': str(ACP / 'node_modules/.bin/zcode-acp-server')})
    entry.setdefault('env', {}).update({'ZCODE_BIN': str(DESKTOP / 'resources/glm/zcode.cjs'),
                                      'ZCODE_APP_VERSION': DESKTOP_VERSION})
    run('bb', 'plugin', 'config', 'provider-acp', 'set', 'customAgents',
        json.dumps(agents, ensure_ascii=False), stdout=subprocess.DEVNULL)
    print('Installed ZCode Start Plan provider. Verify its models in BB.')


if __name__ == '__main__':
    main()

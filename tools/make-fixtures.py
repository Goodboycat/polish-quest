# python3 tools/make-fixtures.py -> rebuilds the small test zips used by tools/e2e*.cjs in /tmp/dt and /tmp/zt
import zipfile, os
os.makedirs('/tmp/dt', exist_ok=True); os.makedirs('/tmp/zt', exist_ok=True)
def z(path, files):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as f:
        for n, t in files.items(): f.writestr(n, t)
z('/tmp/dt/unity.zip', {
 'Star Hopper/ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 2022.3.10f1',
 'Star Hopper/ProjectSettings/ProjectSettings.asset': 'productName: Star Hopper\n',
 'Star Hopper/Assets/Scripts/Player.cs': 'using UnityEngine;\npublic class Player : MonoBehaviour { void Update(){ Jump(); } void Jump(){} }',
 'Star Hopper/Assets/Scripts/SaveSystem.cs': 'using UnityEngine; public class SaveSystem { void Save(){ PlayerPrefs.Save(); } }'})
z('/tmp/dt/godot.zip', {
 'proj/project.godot': 'config_version=5\n[application]\nconfig/name="Dungeon Dash"\n',
 'proj/player.gd': 'extends CharacterBody2D\n@export var speed = 200\nfunc _physics_process(d):\n\tmove_and_slide()\n',
 'proj/main.tscn': '[gd_scene format=3]\n'})
z('/tmp/dt/phaser.zip', {
 'moon/package.json': '{"name":"moon-cat","dependencies":{"phaser":"^3.80.0"}}',
 'moon/index.html': '<html><script type="module" src="/src/main.js"></script></html>',
 'moon/src/main.js': 'import Phaser from "phaser"; new Phaser.Game({type:Phaser.AUTO, scene:{create(){ this.add.text(10,10,"match three puzzle grid"); }}});'})
z('/tmp/dt/mystery.zip', {'stuff/notes.txt': 'hello', 'stuff/data.bin': 'xx'})
open('/tmp/zt/junk.zip', 'wb').write(b'this is not a zip at all' * 10)
open('/tmp/zt/seven.zip', 'wb').write(b"7z\xbc\xaf\x27\x1c" + b'\0' * 64)
d = open('/tmp/dt/phaser.zip', 'rb').read(); open('/tmp/zt/cut.zip', 'wb').write(d[:len(d) // 2])
print('fixtures ok')

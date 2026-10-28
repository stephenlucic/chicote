# OpenWhip (versión reducida)

Fork mínimo de [GitFrog1111/OpenWhip](https://github.com/GitFrog1111/OpenWhip). Solo el látigo. macOS y Windows.

## Cambios respecto al original

- Click izquierdo en el ícono de la barra de menú / bandeja del sistema abre el látigo (en el original no funcionaba en macOS). El menú "Quit" pasa al click derecho.
- El latigazo es solo visual y sonoro: no manda Ctrl-C ni escribe mensajes. No necesita permiso de Accesibilidad.
- En macOS, el látigo se ve también sobre apps en pantalla completa.
- Se quitó el soporte para Linux y `koffi`.
- Electron actualizado de 33 a 44.

## Instalar

Requiere Node.js 18+ y git.

```bash
git clone https://github.com/stephenlucic/openwhip.git
cd openwhip
npm install
npm install -g .
openwhip
```

## Uso

- Click en el ícono (barra de menú en macOS, bandeja del sistema en Windows): aparece el látigo.
- Click: suelta el látigo.
- Click derecho en el ícono: Quit.

## Licencia

MIT. Ver [LICENSE](LICENSE).

# Chicote

Un látigo en pantalla para bromear. Lo sacas desde el ícono, lo agitas con el mouse y suena el latigazo. Solo eso: no toca el teclado ni otras apps.

Funciona en macOS y Windows.

## Instalar

Necesitas [Node.js](https://nodejs.org) 18 o superior y [git](https://git-scm.com).

```bash
npm install -g github:stephenlucic/chicote
```

En Windows, ejecútalo en PowerShell o en el Símbolo del sistema.

## Usar

```bash
chicote
```

- **Sacar el látigo:** click en el ícono. En macOS está en la barra de menú (arriba a la derecha); en Windows, en la bandeja del sistema (abajo a la derecha, puede estar dentro de la flechita `^`).
- **Latigazo:** mueve el mouse rápido.
- **Soltar el látigo:** click en cualquier parte.
- **Cerrar Chicote:** click derecho en el ícono → Quit.

La primera vez que lo ejecutas descarga Electron, así que puede tardar un poco en aparecer el ícono.

## Desinstalar

```bash
npm uninstall -g chicote
```

## Actualizar

Vuelve a ejecutar el comando de instalación.

## Créditos

Basado en [OpenWhip](https://github.com/GitFrog1111/OpenWhip) de GitFrog1111 (MIT). Cambios respecto al original:

- El click izquierdo en el ícono abre el látigo (en el original no funcionaba en macOS) y el menú pasa al click derecho.
- El latigazo es solo visual y sonoro: el original mandaba Ctrl-C y escribía mensajes en la terminal. Ya no necesita permiso de Accesibilidad.
- En macOS, el látigo se ve también sobre apps en pantalla completa.
- Sin soporte para Linux.
- Electron actualizado de 33 a 44.

## Licencia

MIT. Ver [LICENSE](LICENSE).

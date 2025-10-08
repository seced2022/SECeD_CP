# SECeD - Control — Editor ↔ Visor sincronizados (Firebase 'secedcp')

## Qué subir
- `index.html`, `styles.css`, `app.js`
- `firebase-config.js` (ya con tu proyecto `secedcp`)
- `sync.js`
- `logo.svg`, `logo.png` (placeholder), `favicon.png`

## Pasos en Firebase
1) **Firestore Database** → **Crear base de datos** (modo Production).  
2) **Rules** → (para pruebas) pega y **Publica**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tramos/{tramo} {
      allow read, write: if true; // SOLO para pruebas
    }
  }
}
```
> Después podrás endurecerlas (ver más abajo).

## Uso
- **Editor (con controles):**  
  `https://TU-USUARIO.github.io/TU-REPO/?tramo=mi-tramo`
- **Visor (solo lectura):**  
  `https://TU-USUARIO.github.io/TU-REPO/?viewer=1&tramo=mi-tramo`

> Deben usar **exactamente el mismo `tramo`**. Si no lo pones, la página lo pedirá y lo guardará en `sessionStorage`.

## Reglas más estrictas (opcional con writeKey)
1) En `firebase-config.js` añade:
```js
window.WRITE_KEY = "secreto-SECeD-2025";
```
2) En **Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tramos/{tramo} {
      allow read: if true;
      allow write: if request.resource.data.writeKey == "secreto-SECeD-2025";
    }
  }
}
```
El **editor** escribirá con esa clave automáticamente (el visor no escribe).

## Problemas comunes
- `firebase is not defined` → revisa el orden de `<script>` en `index.html` (Firebase compat → config → sync → app).
- `Missing or insufficient permissions` → publica las reglas de pruebas o ajusta las definitivas.
- No aparece `tramos/mi-tramo` → mira la **Consola** del navegador (F12) para ver el error exacto.

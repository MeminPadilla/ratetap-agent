# Roll de Estaciones — La Estancia

App web para hacer el **roll de estaciones** del restaurante de forma digital,
sin papel. Reemplaza la hoja que el jefe de piso saca cada mañana.

## Qué hace (versión 1)

- **Modo Mesero:** el mesero escribe su nombre y toca la zona o el rol donde se
  quiere poner. La suya queda marcada. Puede cambiarse tocando otra.
- **Modo Capitán:** ve todo el tablero, cuántas zonas están tomadas, puede
  liberar una zona (×), empezar un **roll nuevo en blanco** y **descargar el PDF**
  para mandárselo a las hostess.
- Las zonas reflejan el plano real: Terraza Baja (1, 2), Terraza Alta, Abanico
  (3, 4) y Salón (5, 6, 7, 8), más los auxiliares (Terraza, Salón, Runners, Pluma).

> Esta primera versión guarda todo en el mismo dispositivo (sirve para ver el
> diseño y el flujo). El siguiente paso es conectarlo a la nube para que cada
> mesero entre desde su celular y el capitán lo vea **en vivo**.

## Cómo correrlo

```bash
cd web
npm install
npm run dev      # abre el link que aparece (ej: http://localhost:5173)
```

Para generar la versión lista para publicar:

```bash
npm run build    # deja los archivos en web/dist
```

## Dónde se configura

- `src/config/restaurant.ts` — las zonas, áreas y auxiliares del restaurante.
  Si cambia el layout, solo se edita este archivo.

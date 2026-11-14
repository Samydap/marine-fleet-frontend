import { etiquetaNivelAmenaza, type NivelAmenaza } from '@shared/utils/nivel-amenaza';

interface Props {
  readonly nivel: NivelAmenaza | null | undefined;
  /** Prefija "Amenaza" en el texto visible (fuera de una columna ya titulada "Amenaza"). */
  readonly conPrefijo?: boolean;
}

/**
 * Barras del nivel: 1, 2 o 3 llenas. La forma distingue el nivel sin depender
 * del color (regla del color con nombre); "Sin clasificar" lleva las tres vacias.
 */
function Barras({ llenas }: { readonly llenas: number }): React.ReactElement {
  return (
    <svg
      className="badge-amenaza-barras"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 4.25}
          y={8 - i * 3}
          width="3"
          height={4 + i * 3}
          rx="0.75"
          fill={i < llenas ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

/** Con el sustantivo delante concuerda en femenino: "Amenaza alta". */
const CON_PREFIJO: Readonly<Record<NivelAmenaza, string>> = {
  PENDIENTE: 'Amenaza sin clasificar',
  BAJO: 'Amenaza baja',
  MEDIO: 'Amenaza media',
  ALTO: 'Amenaza alta',
};

const LLENAS: Readonly<Record<NivelAmenaza, number>> = { PENDIENTE: 0, BAJO: 1, MEDIO: 2, ALTO: 3 };

/**
 * Nivel de amenaza (RF-5). Color semantico + etiqueta + barras: nunca solo
 * color. El texto usa la variante "tinta" de cada nivel sobre su fondo tintado
 * (>= 4.5:1); el color base del nivel se reserva para graficos.
 *
 *   <BadgeAmenaza nivel={criminal.nivelAmenaza} />
 */
export function BadgeAmenaza({ nivel, conPrefijo = false }: Props): React.ReactElement {
  const valor: NivelAmenaza = nivel ?? 'PENDIENTE';
  const etiqueta = etiquetaNivelAmenaza(valor);

  return (
    <span
      className={`badge-amenaza badge-amenaza--${valor.toLowerCase()}`}
      title={`Nivel de amenaza: ${etiqueta}`}
    >
      <Barras llenas={LLENAS[valor]} />
      {conPrefijo ? CON_PREFIJO[valor] : etiqueta}
    </span>
  );
}

import { PestanasSeccion } from '@shared/ui/PestanasSeccion';

interface Props {
  /** Reportes que esperan revision; null si aun no se sabe. */
  readonly pendientes: number | null;
}

/**
 * Las dos bandejas del centro de inteligencia. La barra lateral tiene una sola
 * entrada ("Avistamientos"); aqui se pasa al material crudo de la ciudadania.
 */
export function PestanasInteligencia({ pendientes }: Props): React.ReactElement | null {
  return (
    <PestanasSeccion
      etiqueta="Secciones del centro de inteligencia"
      secciones={[
        { a: '/inteligencia', etiqueta: 'Avistamientos' },
        {
          a: '/inteligencia/reportes',
          etiqueta: 'Reportes ciudadanos',
          contador: pendientes,
          contadorEtiqueta: 'por revisar',
        },
      ]}
    />
  );
}

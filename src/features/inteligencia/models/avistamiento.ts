import type { PageQuery } from '@core/models/page-result';

/**
 * RF-3. Espejo del contrato del backend para avistamientos.
 *
 * El esquema real solo tiene id, criminal_id, fecha_hora y ubicacion: no hay
 * `testigo` ni `verificado`, aunque la UI de la v1 los insinuaba. Si el equipo
 * los necesita, van por migracion en el backend, no agregando campos aqui.
 */
export interface Avistamiento {
  readonly id: string;
  readonly criminalId: string;
  readonly criminalNombre: string;
  readonly fechaHora: string;
  readonly ubicacion: string;
}

export interface AvistamientoPayload {
  criminalId: string;
  /** Formato del <input type="datetime-local">: YYYY-MM-DDTHH:mm */
  fechaHora: string;
  ubicacion: string;
}

export interface FiltroAvistamientos extends PageQuery {
  criminalId?: string;
}

/**
 * Lo minimo que esta feature necesita saber de un criminal para el selector.
 *
 * Se declara aqui y NO se importa de features/criminales: ese import esta
 * prohibido por la regla de aislamiento y el linter lo bloquea. La frontera
 * entre features es el endpoint del backend, no un import directo.
 */
export interface CriminalOpcion {
  readonly id: string;
  readonly nombre: string;
  readonly estado: 'ACTIVO' | 'CAPTURADO' | 'MUERTO';
}

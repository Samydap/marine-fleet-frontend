import { describe, expect, it } from 'vitest';
import type { CriminalEnCartel } from '../models/cartel';
import { datosDesdeCriminal, etiquetaMotivo, nombreArchivo } from './instantanea';

describe('datosDesdeCriminal', () => {
  it('arma la vista previa de la galeria con los datos actuales', () => {
    const c: CriminalEnCartel = {
      id: 'c-1',
      nombre: 'Nico Robin',
      alias: ['Niña Demonio'],
      fotoUrl: null,
      estado: 'ACTIVO',
      nivelAmenaza: 'ALTO',
      recompensaVigenteMonto: 930_000_000,
      organizacion: { organizacionNombre: 'Piratas del Sombrero de Paja', categoria: 'PIRATA' },
      updatedAt: '2026-11-01T10:00:00Z',
    };
    expect(datosDesdeCriminal(c)).toMatchObject({
      criminalId: 'c-1',
      recompensa: 930_000_000,
      organizacion: 'Piratas del Sombrero de Paja',
      categoriaOrganizacion: 'PIRATA',
      textoLegal: null,
    });
  });
});

describe('nombreArchivo y motivo', () => {
  it('genera un nombre de archivo sin tildes ni espacios', () => {
    expect(nombreArchivo('Nico Robín', 3, 'pdf')).toBe('cartel-nico-robin-v3.pdf');
    expect(nombreArchivo('???', 1, 'svg')).toBe('cartel-criminal-v1.svg');
  });

  it('traduce el motivo de generacion', () => {
    expect(etiquetaMotivo('CAMBIO_RECOMPENSA')).toBe('Cambio de recompensa');
    expect(etiquetaMotivo('OTRO')).toBe('OTRO');
  });
});

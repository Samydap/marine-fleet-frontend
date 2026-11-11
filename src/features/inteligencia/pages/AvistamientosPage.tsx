import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Permiso } from '@core/session/permiso.enum';
import { notificar } from '@core/services/notification.store';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';
import { formatearFecha, valorFechaHoraLocal } from '@shared/utils/fecha';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import type { Avistamiento, CriminalOpcion } from '../models/avistamiento';

/**
 * RF-3 · Dev 5.
 *
 * PORTADO DE LA v1 (frontend/src/App.tsx). Se conservan el comportamiento, el
 * marcado y las clases CSS, de modo que la pantalla se ve y se usa igual que
 * antes. Lo que cambia es donde vive cada cosa:
 *
 *   fetch a mano + readError      ->  inteligenciaApi + errorInterceptor
 *   localDateTimeValue/formatDate ->  @shared/utils/fecha
 *   mensajes de error y exito     ->  notificar (notificaciones globales)
 *   indicador de conexion         ->  se deriva del ultimo resultado de carga
 *
 * El estado del formulario sigue siendo local con useState, igual que en la v1:
 * es estado de una sola pantalla y no hay razon para subirlo a un store.
 *
 * OJO: este modulo del backend todavia no existe (es tarea del Sprint 1), asi
 * que la pantalla compila y se renderiza, pero las llamadas fallaran hasta que
 * el endpoint /api/v1/avistamientos este implementado.
 */

interface EstadoFormulario {
  criminalId: string;
  fechaHora: string;
  ubicacion: string;
}

const FORMULARIO_VACIO: EstadoFormulario = { criminalId: '', fechaHora: '', ubicacion: '' };

export function AvistamientosPage(): React.ReactElement {
  const [criminales, setCriminales] = useState<CriminalOpcion[]>([]);
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [formulario, setFormulario] = useState<EstadoFormulario>(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [conectado, setConectado] = useState<boolean | null>(null);

  const puedeEscribir = useHasPermission(Permiso.INTELIGENCIA_ESCRIBIR);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [pagina, opciones] = await Promise.all([
        inteligenciaApi.listarAvistamientos({ limit: 100 }),
        inteligenciaApi.listarCriminalesParaSelector(),
      ]);

      setAvistamientos(pagina.data);
      setCriminales(opciones);
      setConectado(true);

      setFormulario((actual) => ({
        ...actual,
        criminalId: actual.criminalId || opciones[0]?.id || '',
        fechaHora: actual.fechaHora || valorFechaHoraLocal(),
      }));
    } catch {
      // El errorInterceptor ya notifico el motivo.
      setConectado(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // Filtrado en cliente, igual que en la v1: la lista cabe en memoria.
  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es');
    if (!consulta) return avistamientos;

    return avistamientos.filter(
      (item) =>
        item.criminalNombre.toLocaleLowerCase('es').includes(consulta) ||
        item.ubicacion.toLocaleLowerCase('es').includes(consulta),
    );
  }, [avistamientos, busqueda]);

  function cambiarCampo(campo: keyof EstadoFormulario, valor: string): void {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function reiniciarFormulario(): void {
    setEditandoId(null);
    setFormulario({
      criminalId: criminales[0]?.id ?? '',
      fechaHora: valorFechaHoraLocal(),
      ubicacion: '',
    });
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();

    if (!formulario.criminalId || !formulario.fechaHora || !formulario.ubicacion.trim()) {
      notificar.error('Completa todos los campos antes de guardar.');
      return;
    }

    const payload = {
      criminalId: formulario.criminalId,
      fechaHora: formulario.fechaHora,
      ubicacion: formulario.ubicacion.trim(),
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await inteligenciaApi.actualizarAvistamiento(editandoId, payload);
        notificar.exito('El avistamiento se actualizó correctamente.');
      } else {
        await inteligenciaApi.crearAvistamiento(payload);
        notificar.exito('El avistamiento se registró correctamente.');
      }
      reiniciarFormulario();
      await cargarDatos();
    } catch {
      // Notificado por el interceptor.
    } finally {
      setGuardando(false);
    }
  }

  function comenzarEdicion(item: Avistamiento): void {
    setEditandoId(item.id);
    setFormulario({
      criminalId: item.criminalId,
      fechaHora: item.fechaHora.slice(0, 16),
      ubicacion: item.ubicacion,
    });
    document.getElementById('formulario-avistamiento')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  async function eliminar(item: Avistamiento): Promise<void> {
    const aceptado = window.confirm(
      `¿Eliminar el avistamiento de ${item.criminalNombre} en "${item.ubicacion}"? ` +
        'Esta acción no se puede deshacer.',
    );
    if (!aceptado) return;

    try {
      await inteligenciaApi.eliminarAvistamiento(item.id);
      notificar.exito('El avistamiento se eliminó correctamente.');
      if (editandoId === item.id) reiniciarFormulario();
      await cargarDatos();
    } catch {
      // Notificado por el interceptor.
    }
  }

  return (
    <>
      <PageHeader
        kicker="CENTRO DE INTELIGENCIA NAVAL"
        titulo="Registro de avistamientos"
        descripcion="Centraliza los reportes de presencia criminal y mantén la información operativa actualizada."
      >
        <button
          type="button"
          className="refresh-button"
          onClick={() => void cargarDatos()}
          disabled={cargando}
          title="Actualizar lista"
        >
          <span className={cargando ? 'spinning' : ''}>↻</span> Actualizar
        </button>
      </PageHeader>

      <section className="stats-grid" aria-label="Resumen">
        <article className="stat-card">
          <span className="stat-icon navy">◎</span>
          <div>
            <span className="stat-label">AVISTAMIENTOS</span>
            <strong>{avistamientos.length}</strong>
            <small>Registros almacenados</small>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon gold">♙</span>
          <div>
            <span className="stat-label">CRIMINALES</span>
            <strong>{criminales.length}</strong>
            <small>En el catálogo</small>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">✓</span>
          <div>
            <span className="stat-label">ACTIVOS</span>
            <strong>{criminales.filter((c) => c.estado === 'ACTIVO').length}</strong>
            <small>Con estado activo</small>
          </div>
        </article>
      </section>

      <section className="workspace">
        {puedeEscribir && (
          <aside className="panel form-panel" id="formulario-avistamiento">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">
                  {editandoId ? 'ACTUALIZACIÓN' : 'NUEVO REGISTRO'}
                </span>
                <h2>{editandoId ? 'Editar avistamiento' : 'Registrar avistamiento'}</h2>
              </div>
              <span className="heading-symbol">{editandoId ? '✎' : '+'}</span>
            </div>

            <form onSubmit={(e) => void enviarFormulario(e)} className="sighting-form">
              <label htmlFor="criminal">
                Criminal relacionado <span>*</span>
              </label>
              <select
                id="criminal"
                value={formulario.criminalId}
                onChange={(e) => cambiarCampo('criminalId', e.target.value)}
                required
                disabled={cargando || criminales.length === 0}
              >
                {criminales.length === 0 && <option value="">No hay criminales disponibles</option>}
                {criminales.map((criminal) => (
                  <option key={criminal.id} value={criminal.id}>
                    {criminal.nombre} · {criminal.estado}
                  </option>
                ))}
              </select>

              <label htmlFor="fecha">
                Fecha y hora <span>*</span>
              </label>
              <input
                id="fecha"
                type="datetime-local"
                value={formulario.fechaHora}
                onChange={(e) => cambiarCampo('fechaHora', e.target.value)}
                required
              />

              <label htmlFor="ubicacion">
                Ubicación del avistamiento <span>*</span>
              </label>
              <textarea
                id="ubicacion"
                value={formulario.ubicacion}
                onChange={(e) => cambiarCampo('ubicacion', e.target.value)}
                placeholder="Ej. Archipiélago Sabaody, muelle norte..."
                rows={3}
                maxLength={2000}
                required
              />
              <div className="field-hint">
                Describe la isla, zona, puerto o referencia geográfica.
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={guardando || cargando || criminales.length === 0}
                >
                  {guardando
                    ? 'Guardando...'
                    : editandoId
                      ? 'Guardar cambios'
                      : 'Registrar avistamiento'}
                </button>
                {editandoId && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => reiniciarFormulario()}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
            <div className="form-footnote">
              <span>◆</span> Los campos marcados con * son obligatorios.
            </div>
          </aside>
        )}

        <section className="panel records-panel">
          <div className="records-heading">
            <div>
              <span className="section-kicker">ARCHIVO OPERATIVO</span>
              <h2>Avistamientos registrados</h2>
              <p>Consulta y administra los reportes existentes.</p>
            </div>
          </div>

          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Buscar por criminal o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar avistamientos"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
                ×
              </button>
            )}
          </div>

          <div className="table-meta">
            <span>
              {busqueda
                ? `${filtrados.length} resultado(s)`
                : `${avistamientos.length} registro(s)`}
            </span>
            {conectado !== null && (
              <span className={`connection ${conectado ? 'connected' : 'error'}`}>
                <span className="connection-dot" />
                {conectado ? 'Datos en vivo' : 'Sin conexión con la API'}
              </span>
            )}
          </div>

          {cargando ? (
            <EmptyState
              titulo="Cargando archivo..."
              detalle="Consultando los registros de la Marina."
              icono="◷"
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo={busqueda ? 'No hay coincidencias' : 'Todavía no hay avistamientos'}
              detalle={
                busqueda
                  ? 'Prueba con otro nombre o ubicación.'
                  : 'Cuando registres el primer avistamiento, aparecerá aquí.'
              }
            >
              {busqueda && (
                <button className="text-button" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </button>
              )}
            </EmptyState>
          ) : (
            <div className="sightings-list">
              {filtrados.map((item, indice) => (
                <article className="sighting-row" key={item.id}>
                  <div className="record-index">{String(indice + 1).padStart(2, '0')}</div>
                  <div className="record-main">
                    <div className="record-title-line">
                      <h3>{item.criminalNombre}</h3>
                      <span className="record-badge">REGISTRADO</span>
                    </div>
                    <p className="record-location">
                      <span>⌖</span> {item.ubicacion}
                    </p>
                    <p className="record-date">
                      <span>◷</span> {formatearFecha(item.fechaHora)}
                    </p>
                  </div>
                  {puedeEscribir && (
                    <div className="record-actions">
                      <button
                        className="icon-button edit-button"
                        onClick={() => comenzarEdicion(item)}
                        aria-label={`Editar avistamiento de ${item.criminalNombre}`}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete-button"
                        onClick={() => void eliminar(item)}
                        aria-label={`Eliminar avistamiento de ${item.criminalNombre}`}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}

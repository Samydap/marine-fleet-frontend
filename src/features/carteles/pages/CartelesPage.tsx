import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificar } from '@core/services/notification.store';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoBrujula } from '@shared/ui/iconos';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { OpcionesZona } from '@shared/ui/CampoZona';
import {
  opcionesCategoria,
  opcionesEstadoCriminal,
  type CategoriaCriminal,
  type EstadoCriminal,
} from '@shared/utils/criminal';
import { CartelWanted } from '../components/CartelWanted';
import { cartelesApi } from '../data-access/carteles-api';
import { useGaleriaStore } from '../data-access/carteles.store';
import { datosDesdeCriminal } from '../utils/instantanea';
import '../carteles.css';

/**
 * RF-2 galeria: el tablon de carteles. Cada cartel abre su version oficial,
 * su historial de versiones y las descargas.
 */
export function CartelesPage(): React.ReactElement {
  const { criminales, meta, cargando, error, consultadoEn, filtro, cargar } = useGaleriaStore();
  const puedeGenerar = useHasPermission(Permiso.CARTELES_GENERAR);
  const [texto, setTexto] = useState(filtro.q ?? '');
  const [emitiendo, setEmitiendo] = useState(false);
  const q = useValorDiferido(texto.trim(), 350);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  useCambiosSincronizados(
    [
      EVENTOS.CARTEL_GENERADO,
      EVENTOS.CRIMINAL_REGISTRADO,
      EVENTOS.CRIMINAL_ESTADO_CAMBIADO,
      EVENTOS.RECOMPENSA_VIGENTE,
    ],
    () => void cargar({}, true),
  );

  async function emitirFaltantes(): Promise<void> {
    setEmitiendo(true);
    try {
      const r = await cartelesApi.emitirFaltantes();
      if (r.generados === 0 && r.fallidos.length === 0) {
        notificar.info('Todos los criminales ya tenían su cartel.');
      } else {
        notificar.exito(
          `Se emitieron ${r.generados} carteles` +
            (r.fallidos.length ? `; ${r.fallidos.length} no se pudieron generar.` : '.'),
        );
      }
      void cargar({}, true);
    } catch {
      // Aviso publicado por el interceptor.
    } finally {
      setEmitiendo(false);
    }
  }

  const activos = [
    filtro.estado === 'ACTIVO' ? undefined : (filtro.estado ?? 'todos'),
    filtro.categoria,
    filtro.zonaInfluenciaId,
  ].filter(Boolean).length;

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      estado: 'ACTIVO',
      categoria: undefined,
      zonaInfluenciaId: undefined,
      page: 1,
    });
  }

  const hayFiltros = activos > 0 || Boolean(q);
  const primeraCarga = cargando && criminales.length === 0 && !error;

  return (
    <>
      <PageHeader
        titulo="Carteles de búsqueda"
        descripcion="Se emiten solos al registrar o cambiar a un criminal. Abre uno para ver su versión oficial, descargarlo o imprimirlo."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeGenerar && (
          <Boton
            onClick={() => void emitirFaltantes()}
            cargando={emitiendo}
            textoCargando="Emitiendo…"
          >
            Emitir carteles faltantes
          </Boton>
        )}
      </PageHeader>

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por nombre o alias"
        filtrosActivos={activos}
        onLimpiar={limpiar}
        resumen={
          meta.total > 0
            ? `${meta.total.toLocaleString('es-CO')} ${meta.total === 1 ? 'cartel' : 'carteles'}`
            : undefined
        }
      >
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoCriminal()}
          onChange={(e) =>
            void cargar({ estado: (e.target.value || undefined) as EstadoCriminal, page: 1 })
          }
        />
        <CampoSelect
          etiqueta="Tipo"
          opcionVacia="Todos"
          value={filtro.categoria ?? ''}
          opciones={opcionesCategoria()}
          onChange={(e) =>
            void cargar({ categoria: (e.target.value || undefined) as CategoriaCriminal, page: 1 })
          }
        />
        <CampoSelect
          etiqueta="Zona"
          opcionVacia="Todos los mares"
          value={filtro.zonaInfluenciaId ?? ''}
          onChange={(e) => void cargar({ zonaInfluenciaId: e.target.value || undefined, page: 1 })}
        >
          <OpcionesZona />
        </CampoSelect>
      </BarraFiltros>

      {error && criminales.length === 0 ? (
        <EstadoError error={error} onReintentar={() => void cargar()} />
      ) : primeraCarga ? (
        <ul className="tablon" aria-busy="true" aria-label="Cargando carteles">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton forma="bloque" className="tablon-hueso" />
            </li>
          ))}
        </ul>
      ) : criminales.length === 0 ? (
        hayFiltros ? (
          <EstadoVacio
            icono={<IconoBrujula tamano={28} />}
            titulo="Ningún cartel coincide con la búsqueda"
            detalle="Prueba con otro nombre o alias, o quita algún filtro."
          >
            <Boton variante="fantasma" onClick={limpiar}>
              Limpiar filtros
            </Boton>
          </EstadoVacio>
        ) : (
          <EstadoVacio
            titulo="No hay criminales en búsqueda"
            detalle="Cuando se registre un criminal, su cartel aparecerá en este tablón."
          />
        )
      ) : (
        <ul
          className={cargando ? 'tablon tablon--actualizando' : 'tablon'}
          aria-label="Carteles"
          aria-busy={cargando || undefined}
        >
          {criminales.map((c) => (
            <li key={c.id} className="tablon-item">
              <Link
                to={c.id}
                className="tablon-enlace"
                aria-label={`Abrir el cartel de ${c.nombre}`}
              >
                <CartelWanted datos={datosDesdeCriminal(c)} tamano="miniatura" />
              </Link>
              <div className="tablon-datos">
                <InsigniaTipoCriminal
                  categoria={c.organizacion?.categoria ?? null}
                  variante="icono"
                />
                <BadgeAmenaza nivel={c.nivelAmenaza} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Paginacion
        meta={meta}
        sustantivo="carteles"
        deshabilitada={cargando}
        onCambiarPagina={(page) => void cargar({ page })}
      />
    </>
  );
}

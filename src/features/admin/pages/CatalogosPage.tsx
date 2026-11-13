import { useState } from 'react';
import { Boton } from '@shared/ui/Boton';
import { EstadoCargando, EstadoError, EstadoVacio } from '@shared/ui/Estados';
import { IconoEditar, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { SeccionesAdmin } from '../components/SeccionesAdmin';
import { DialogoCatalogo, type ObjetivoCatalogo } from '../components/DialogoCatalogo';
import {
  recargarCatalogoCompleto,
  useCatalogoCompleto,
} from '../data-access/catalogo-completo.store';
import { etiquetaTipoMar } from '../models/catalogo';

/**
 * RF-7 Catalogo geografico: los Cuatro Mares y la Grand Line, sus zonas de
 * influencia y las bases navales de cada zona (ubicacion y comandante). Se lee
 * como el mapa: mar, zona, base.
 */
export function CatalogosPage(): React.ReactElement {
  const { mares, zonasDeMar, bases, estado } = useCatalogoCompleto();
  const [objetivo, setObjetivo] = useState<ObjetivoCatalogo | null>(null);

  // La cabecera cuenta lo que esta en servicio; lo inactivo se ve atenuado en el mapa.
  const maresActivos = mares.filter((m) => m.activo).length;
  const zonasActivas = mares.reduce(
    (n, m) => n + zonasDeMar(m.id).filter((z) => z.activo).length,
    0,
  );
  const basesActivas = bases.filter((b) => b.estado === 'ACTIVA').length;

  let contenido: React.ReactNode;
  if (estado === 'error') {
    contenido = (
      <EstadoError
        variante="pantalla"
        titulo="No se pudo cargar el catálogo geográfico"
        onReintentar={() => void recargarCatalogoCompleto()}
      />
    );
  } else if (mares.length === 0 && estado !== 'listo') {
    contenido = <EstadoCargando mensaje="Cargando mares, zonas y bases…" filas={5} />;
  } else if (mares.length === 0) {
    contenido = (
      <EstadoVacio
        variante="pantalla"
        titulo="El catálogo geográfico está vacío"
        detalle="Registra los mares para poder ubicar zonas, bases y criminales."
      >
        <Boton variante="principal" onClick={() => setObjetivo({ tipo: 'mar' })}>
          Registrar el primer mar
        </Boton>
      </EstadoVacio>
    );
  } else {
    contenido = (
      <div className="mapa">
        {mares.map((mar) => {
          const zonas = zonasDeMar(mar.id);
          return (
            <section
              key={mar.id}
              className={mar.activo ? 'mapa-mar' : 'mapa-mar mapa-mar--inactivo'}
              aria-labelledby={`mar-${mar.id}`}
            >
              <header className="mapa-mar-cabecera">
                <div>
                  <h2 id={`mar-${mar.id}`}>
                    {mar.nombre}
                    {!mar.activo && <InsigniaEstado etiqueta="Inactivo" tono="neutro" />}
                  </h2>
                  <p>
                    {etiquetaTipoMar(mar.tipo)} · {zonas.length}{' '}
                    {zonas.length === 1 ? 'zona' : 'zonas'}
                  </p>
                </div>
                <div className="mapa-acciones">
                  <Boton
                    tamano="compacto"
                    variante="fantasma"
                    icono={<IconoEditar tamano={16} />}
                    aria-label={`Editar ${mar.nombre}`}
                    onClick={() => setObjetivo({ tipo: 'mar', mar })}
                  >
                    Editar
                  </Boton>
                  <Boton
                    tamano="compacto"
                    icono={<IconoMas tamano={16} />}
                    onClick={() => setObjetivo({ tipo: 'zona', marId: mar.id })}
                  >
                    Añadir zona
                  </Boton>
                </div>
              </header>

              {zonas.length === 0 ? (
                <p className="mapa-vacio">Sin zonas de influencia registradas en este mar.</p>
              ) : (
                zonas.map((zona) => {
                  const basesZona = bases.filter((b) => b.zonaInfluenciaId === zona.id);
                  return (
                    <div
                      key={zona.id}
                      className={zona.activo ? 'mapa-zona' : 'mapa-zona mapa-zona--inactiva'}
                    >
                      <div className="mapa-zona-cabecera">
                        <div>
                          <h3>
                            {zona.nombre}
                            {!zona.activo && <InsigniaEstado etiqueta="Inactiva" tono="neutro" />}
                          </h3>
                          {zona.descripcion && <p>{zona.descripcion}</p>}
                        </div>
                        <div className="mapa-acciones">
                          <Boton
                            tamano="compacto"
                            variante="fantasma"
                            icono={<IconoEditar tamano={16} />}
                            aria-label={`Editar la zona ${zona.nombre}`}
                            onClick={() => setObjetivo({ tipo: 'zona', marId: mar.id, zona })}
                          >
                            Editar
                          </Boton>
                          <Boton
                            tamano="compacto"
                            variante="fantasma"
                            icono={<IconoMas tamano={16} />}
                            aria-label={`Añadir base naval en ${zona.nombre}`}
                            onClick={() => setObjetivo({ tipo: 'base', zonaId: zona.id })}
                          >
                            Añadir base
                          </Boton>
                        </div>
                      </div>
                      {basesZona.length === 0 ? (
                        <p className="mapa-vacio">Sin bases navales en esta zona.</p>
                      ) : (
                        <ul className="mapa-bases">
                          {basesZona.map((base) => (
                            <li
                              key={base.id}
                              className={
                                base.estado === 'ACTIVA'
                                  ? 'mapa-base'
                                  : 'mapa-base mapa-base--inactiva'
                              }
                            >
                              <strong>
                                {base.nombre}
                                {base.estado !== 'ACTIVA' && (
                                  <InsigniaEstado etiqueta="Inactiva" tono="neutro" />
                                )}
                              </strong>
                              <span>
                                <span className="sr-only">Ubicación: </span>
                                {base.ubicacion}
                              </span>
                              <span>
                                <span className="mapa-base-etiqueta">Comandante</span>{' '}
                                {base.comandanteNombre}
                              </span>
                              <Boton
                                tamano="compacto"
                                variante="fantasma"
                                aria-label={`Editar ${base.nombre}`}
                                onClick={() => setObjetivo({ tipo: 'base', zonaId: zona.id, base })}
                              >
                                Editar
                              </Boton>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Mares, zonas y bases"
        descripcion={
          mares.length > 0
            ? `En servicio: ${maresActivos} ${maresActivos === 1 ? 'mar' : 'mares'}, ${zonasActivas} ${zonasActivas === 1 ? 'zona' : 'zonas'} de influencia y ${basesActivas} ${basesActivas === 1 ? 'base naval' : 'bases navales'}.`
            : 'El mapa que ordena filtros, reportes y asignaciones de todo el sistema.'
        }
      >
        <Boton icono={<IconoMas tamano={18} />} onClick={() => setObjetivo({ tipo: 'mar' })}>
          Registrar mar
        </Boton>
      </PageHeader>
      <SeccionesAdmin />
      {contenido}
      <DialogoCatalogo objetivo={objetivo} onCerrar={() => setObjetivo(null)} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { Permiso } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import {
  etiquetaTipoAgrupacion,
  opcionesCategoria,
  type TipoAgrupacion,
} from '@shared/utils/criminal';
import { DialogoOrganizacion } from '../components/DialogoOrganizacion';
import { CampoZona, useNombreZonaConMar } from '@shared/ui/CampoZona';
import { useOrganizacionesStore } from '../data-access/organizaciones.store';
import type { CategoriaOrganizacion, Organizacion } from '../models/criminal';
import '../criminales.css';

const TIPOS: readonly TipoAgrupacion[] = ['TRIPULACION', 'ORGANIZACION', 'BANDA'];

/** RF-1 afiliaciones: tripulaciones, organizaciones y bandas con su tipo. */
export function OrganizacionesPage(): React.ReactElement {
  const { organizaciones, meta, cargando, error, consultadoEn, filtro, cargar } =
    useOrganizacionesStore();
  const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);
  const zonaConMar = useNombreZonaConMar();
  useCatalogos();
  const navegar = useNavigate();

  const [texto, setTexto] = useState(filtro.q ?? '');
  const [registrando, setRegistrando] = useState(false);
  const q = useValorDiferido(texto.trim(), 350);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  const columnas: readonly ColumnaTabla<Organizacion>[] = [
    {
      clave: 'nombre',
      encabezado: 'Nombre',
      principal: true,
      celda: (o) => <Link to={o.id}>{o.nombre}</Link>,
    },
    {
      clave: 'categoria',
      encabezado: 'Tipo de criminal',
      celda: (o) => <InsigniaTipoCriminal categoria={o.categoria} />,
    },
    {
      clave: 'agrupacion',
      encabezado: 'Agrupación',
      celda: (o) => etiquetaTipoAgrupacion(o.tipoAgrupacion),
    },
    {
      clave: 'zona',
      encabezado: 'Zona',
      ocultarEnMovil: true,
      celda: (o) => zonaConMar(o.zonaInfluenciaId) ?? 'Sin zona conocida',
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      celda: (o) =>
        o.activa ? (
          <InsigniaEstado etiqueta="Activa" tono="aviso" />
        ) : (
          <InsigniaEstado etiqueta="Disuelta" tono="neutro" />
        ),
    },
  ];

  const activos = [
    filtro.categoria,
    filtro.tipoAgrupacion,
    filtro.zonaInfluenciaId,
    filtro.activa === true ? undefined : 'x',
  ].filter(Boolean).length;

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      categoria: undefined,
      tipoAgrupacion: undefined,
      zonaInfluenciaId: undefined,
      activa: true,
      page: 1,
    });
  }

  const hayFiltros = activos > 0 || Boolean(q);
  const valorActiva = filtro.activa === undefined ? 'todas' : filtro.activa ? 'si' : 'no';

  return (
    <>
      <PageHeader
        titulo="Tripulaciones y organizaciones"
        descripcion="Tripulaciones piratas, células revolucionarias y organizaciones independientes, con su líder y miembros."
        volver={{ a: '/criminales', etiqueta: 'Criminales' }}
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeEscribir && (
          <Boton
            variante="principal"
            icono={<IconoMas tamano={18} />}
            onClick={() => setRegistrando(true)}
          >
            Registrar organización
          </Boton>
        )}
      </PageHeader>

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por nombre"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
        <CampoSelect
          etiqueta="Tipo de criminal"
          opcionVacia="Todos"
          value={filtro.categoria ?? ''}
          opciones={opcionesCategoria()}
          onChange={(e) =>
            void cargar({
              categoria: (e.target.value || undefined) as CategoriaOrganizacion,
              page: 1,
            })
          }
        />
        <CampoSelect
          etiqueta="Agrupación"
          opcionVacia="Todas"
          value={filtro.tipoAgrupacion ?? ''}
          opciones={TIPOS.map((t) => ({ valor: t, etiqueta: etiquetaTipoAgrupacion(t) }))}
          onChange={(e) =>
            void cargar({
              tipoAgrupacion: (e.target.value || undefined) as TipoAgrupacion,
              page: 1,
            })
          }
        />
        <CampoZona
          etiqueta="Zona"
          opcionVacia="Todos los mares"
          value={filtro.zonaInfluenciaId ?? ''}
          onChange={(e) => void cargar({ zonaInfluenciaId: e.target.value || undefined, page: 1 })}
        />
        <CampoSelect
          etiqueta="Estado"
          value={valorActiva}
          opciones={[
            { valor: 'si', etiqueta: 'Activas' },
            { valor: 'no', etiqueta: 'Disueltas' },
            { valor: 'todas', etiqueta: 'Todas' },
          ]}
          onChange={(e) => {
            const v = e.target.value;
            void cargar({ activa: v === 'todas' ? undefined : v === 'si', page: 1 });
          }}
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Tripulaciones y organizaciones"
        filas={organizaciones}
        columnas={columnas}
        claveFila={(o) => o.id}
        cargando={cargando && organizaciones.length === 0}
        actualizando={cargando && organizaciones.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        claseFila={(o) => (o.activa ? undefined : 'criminal-fila--baja')}
        vacio={
          hayFiltros ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ninguna organización coincide con la búsqueda"
              detalle="Prueba con otro nombre o quita algún filtro."
            />
          ) : (
            <EstadoVacio
              titulo="Aún no hay organizaciones registradas"
              detalle="Registra la tripulación u organización para poder afiliar criminales."
            >
              {puedeEscribir && (
                <Boton variante="secundario" onClick={() => setRegistrando(true)}>
                  Registrar la primera
                </Boton>
              )}
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="organizaciones"
        deshabilitada={cargando}
        onCambiarPagina={(page) => void cargar({ page })}
      />

      <DialogoOrganizacion
        abierto={registrando}
        onCerrar={() => setRegistrando(false)}
        onGuardada={(org) => {
          setRegistrando(false);
          navegar(org.id);
        }}
      />
    </>
  );
}

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CategoriaCriminal } from '@shared/utils/criminal';
import { InsigniaEstado, type TonoEstado } from './InsigniaEstado';
import { InsigniaTipoCriminal } from './InsigniaTipoCriminal';
import { RetratoCriminal } from './RetratoCriminal';

describe('InsigniaTipoCriminal', () => {
  it.each([
    ['PIRATA', 'Pirata', 'insignia-tipo--pirata'],
    ['REVOLUCIONARIO', 'Ejército Revolucionario', 'insignia-tipo--revolucionario'],
    [
      'CRIMINAL_INDEPENDIENTE',
      'Organización independiente',
      'insignia-tipo--criminal-independiente',
    ],
  ] as const)('distingue %s con nombre e icono propio', (categoria, etiqueta, clase) => {
    const { container } = render(<InsigniaTipoCriminal categoria={categoria} />);
    expect(screen.getByText(etiqueta)).toHaveClass(clase);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sin afiliacion no lo llama "independiente"', () => {
    render(<InsigniaTipoCriminal categoria={null} />);
    expect(screen.getByText('Sin afiliación')).toHaveClass('insignia-tipo--sin-afiliacion');
  });

  it('la variante de solo icono conserva un nombre accesible', () => {
    render(<InsigniaTipoCriminal categoria="PIRATA" variante="icono" />);
    expect(screen.getByRole('img', { name: 'Pirata' })).toBeInTheDocument();
    expect(screen.queryByText('Pirata')).not.toBeInTheDocument();
  });

  it('cada categoria dibuja un icono distinto', () => {
    const dibujo = (c: CategoriaCriminal): string =>
      render(<InsigniaTipoCriminal categoria={c} />).container.querySelector('svg')?.innerHTML ??
      '';
    const formas = new Set([
      dibujo('PIRATA'),
      dibujo('REVOLUCIONARIO'),
      dibujo('CRIMINAL_INDEPENDIENTE'),
    ]);
    expect(formas.size).toBe(3);
  });
});

describe('InsigniaEstado', () => {
  it('muestra la etiqueta con la clase del tono', () => {
    render(<InsigniaEstado etiqueta="En curso" tono="aviso" />);
    expect(screen.getByText('En curso')).toHaveClass('insignia-estado--aviso');
  });

  it('cada tono tiene una marca de forma distinta (no solo color)', () => {
    const tonos: TonoEstado[] = ['neutro', 'info', 'exito', 'aviso', 'peligro', 'autoridad'];
    const formas = new Set(
      tonos.map(
        (t) =>
          render(<InsigniaEstado etiqueta={t} tono={t} />).container.querySelector('svg')
            ?.innerHTML,
      ),
    );
    expect(formas.size).toBe(tonos.length);
  });

  it('marca el estado en curso', () => {
    const { container } = render(<InsigniaEstado etiqueta="En curso" tono="aviso" enCurso />);
    expect(container.querySelector('.insignia-estado-marca--en-curso')).toBeInTheDocument();
  });
});

describe('RetratoCriminal con marco de cartel', () => {
  it('el retrato con marco de cartel conserva el nombre accesible y no agrega texto', () => {
    const { container, rerender } = render(
      <RetratoCriminal fotoUrl={null} nombre="Barbanegra" marco="cartel" />,
    );
    expect(screen.getByRole('img', { name: 'Barbanegra, sin foto' })).toHaveClass(
      'retrato--cartel',
    );
    expect(container.textContent).not.toContain('WANTED');

    rerender(
      <RetratoCriminal fotoUrl="/api/v1/archivos/fotos/a.png" nombre="Barbanegra" marco="cartel" />,
    );
    expect(screen.getByAltText('Foto de Barbanegra')).toHaveClass('retrato--cartel');
    expect(container.textContent).toBe('');
  });

  it('por defecto no lleva marco', () => {
    render(<RetratoCriminal fotoUrl={null} nombre="Barbanegra" />);
    expect(screen.getByRole('img')).not.toHaveClass('retrato--cartel');
  });
});

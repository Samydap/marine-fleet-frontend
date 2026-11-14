import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PestanasSeccion } from './PestanasSeccion';

function pintar(
  ruta: string,
  secciones: Parameters<typeof PestanasSeccion>[0]['secciones'],
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <PestanasSeccion etiqueta="Secciones de prueba" secciones={secciones} />
    </MemoryRouter>,
  );
}

describe('PestanasSeccion', () => {
  it('marca la seccion abierta con aria-current', () => {
    pintar('/amenaza/criterios', [
      { a: '/amenaza', etiqueta: 'Distribución' },
      { a: '/amenaza/criterios', etiqueta: 'Criterios' },
    ]);
    expect(screen.getByRole('link', { name: 'Criterios' })).toHaveAttribute('aria-current', 'page');
    // `end`: la raiz no queda activa en una subruta.
    expect(screen.getByRole('link', { name: 'Distribución' })).not.toHaveAttribute('aria-current');
  });

  it('con una sola seccion no pinta nada', () => {
    const { container } = pintar('/admin/usuarios', [
      { a: '/admin/usuarios', etiqueta: 'Usuarios' },
    ]);
    expect(container).toBeEmptyDOMElement();
  });

  it('el contador se nombra para el lector y se acota a 99+', () => {
    pintar('/inteligencia', [
      { a: '/inteligencia', etiqueta: 'Avistamientos' },
      {
        a: '/inteligencia/reportes',
        etiqueta: 'Reportes',
        contador: 140,
        contadorEtiqueta: 'por revisar',
      },
    ]);
    expect(screen.getByRole('link', { name: 'Reportes 99+ por revisar' })).toBeInTheDocument();
  });

  it('un contador en cero no se pinta', () => {
    pintar('/inteligencia', [
      { a: '/inteligencia', etiqueta: 'Avistamientos' },
      { a: '/inteligencia/reportes', etiqueta: 'Reportes', contador: 0 },
    ]);
    expect(screen.getByRole('link', { name: 'Reportes' })).toBeInTheDocument();
  });
});

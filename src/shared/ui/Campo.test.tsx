import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CampoAreaTexto, CampoSelect, CampoTexto } from './Campo';

describe('CampoTexto', () => {
  it('asocia la etiqueta visible al control', () => {
    render(<CampoTexto etiqueta="Nombre" />);
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('con error marca aria-invalid y lo enlaza como descripcion', () => {
    render(
      <CampoTexto
        etiqueta="Nombre"
        error="Escribe el nombre."
        ayuda="Como figura en el registro."
      />,
    );
    const control = screen.getByLabelText('Nombre');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('Escribe el nombre. Como figura en el registro.');
  });

  it('sin error no marca aria-invalid', () => {
    render(<CampoTexto etiqueta="Alias" ayuda="Separados por coma." />);
    expect(screen.getByLabelText('Alias')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Alias')).toHaveAccessibleDescription('Separados por coma.');
  });

  it('marca el obligatorio como requerido', () => {
    render(<CampoTexto etiqueta="Nombre" required />);
    expect(screen.getByRole('textbox', { name: /Nombre/ })).toBeRequired();
  });

  it('la etiqueta oculta sigue nombrando el control', () => {
    render(<CampoTexto etiqueta="Buscar" etiquetaOculta />);
    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
  });
});

describe('CampoSelect', () => {
  it('pinta la opcion vacia y las opciones, y notifica el cambio', async () => {
    const onChange = vi.fn();
    render(
      <CampoSelect
        etiqueta="Estado"
        opcionVacia="Todos"
        value=""
        onChange={onChange}
        opciones={[
          { valor: 'ACTIVO', etiqueta: 'En búsqueda' },
          { valor: 'CAPTURADO', etiqueta: 'Capturado' },
        ]}
      />,
    );
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Todos',
      'En búsqueda',
      'Capturado',
    ]);
    await userEvent.setup().selectOptions(screen.getByLabelText('Estado'), 'CAPTURADO');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('CampoAreaTexto', () => {
  it('muestra el contador si se pide y hay maxLength', () => {
    render(
      <CampoAreaTexto
        etiqueta="Observaciones"
        contador
        maxLength={500}
        value="abc"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('3 / 500')).toBeInTheDocument();
  });
});

describe('aria-describedby externo', () => {
  it('se suma al de ayuda y error del campo en lugar de sustituirlo', () => {
    render(
      <>
        <p id="nota-externa">Nota fuera del campo</p>
        <CampoTexto
          etiqueta="Monto"
          ayuda="Solo cifras"
          error="Falta el monto"
          aria-describedby="nota-externa"
        />
      </>,
    );
    const ids = screen.getByLabelText(/Monto/).getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(ids).toContain('nota-externa');
    expect(ids).toHaveLength(3);
  });
});

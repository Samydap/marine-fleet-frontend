import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatearBerries } from '@shared/utils/berries';
import { CambioMonto } from './CambioMonto';

describe('CambioMonto', () => {
  it('cuenta la subida a lectores de pantalla', () => {
    render(<CambioMonto anterior={100} actual={300} />);

    expect(
      screen.getByText(`La recompensa pasó de ${formatearBerries(100)} a ${formatearBerries(300)}`),
    ).toBeInTheDocument();
  });
});

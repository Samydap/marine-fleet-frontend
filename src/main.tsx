import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes';
import './styles.css';
import './shared/ui/ui.css';

const contenedor = document.getElementById('root');
if (!contenedor) {
  throw new Error('No se encontro el elemento #root en index.html.');
}

createRoot(contenedor).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

import { useEffect, useState } from 'react';

/**
 * Devuelve `valor` cuando deja de cambiar durante `ms`. Para la busqueda por
 * texto de BarraFiltros: consulta al backend cuando el usuario termina de
 * escribir, no en cada tecla.
 *
 *   const [texto, setTexto] = useState('');
 *   const q = useValorDiferido(texto, 350);
 *   useEffect(() => void buscar(q), [q]);
 */
export function useValorDiferido<T>(valor: T, ms = 350): T {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setDiferido(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);

  return diferido;
}

import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { nfseService } from './nfseService';
// import { Nfse } from './nfseTypes';

const NewNfseList = () => {
  console.log('🔍 NewNfseList - Componente montado');

  const { enqueueSnackbar } = useSnackbar();
  const [nfses, setNfses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNfses = async () => {
    try {
      setLoading(true);
      const response = await nfseService.listNfse();
      setNfses(response.items);
    } catch (error) {
      setError('Erro ao buscar NFSes');
      enqueueSnackbar('Erro ao buscar NFSes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 NewNfseList - useEffect iniciado');
    fetchNfses();
  }, []);

  if (loading) {
    console.log('🔍 NewNfseList - Renderizando loading');
    return <div>Loading...</div>;
  }
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Lista de NFSe</h1>
      <ul>
        {nfses.map(nfse => (
          <li key={nfse.nfseId}>{nfse.integrationNfseId}</li>
        ))}
      </ul>
    </div>
  );
};

export default NewNfseList;

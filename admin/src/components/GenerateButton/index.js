import React, { useState,useEffect} from 'react';
import { useCMEditViewDataManager, useFetchClient } from '@strapi/helper-plugin';
import Eye from '@strapi/icons/Eye';
import { LinkButton } from '@strapi/design-system/LinkButton';

const CodeGenerator = () => {
  const { get } = useFetchClient();
  const { initialData } = useCMEditViewDataManager();
  const variabiles = useCMEditViewDataManager();
  const [contentData, setContentData] = useState([]);
  const [schemaData, setSchemaData] = useState([]);
  const [contentEntries, setContentEntries] = useState([]);
  const [schemaEntries, setSchemaEntries] = useState([]);
  const id = window.location.pathname.split('::')[1].split('/')[1];
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Nuovo stato per tenere traccia del caricamento dei dati

  if (initialData.publishedAt || initialData.slug == null) {
    return null;
  }

  /*
  Con questo metodo effettuo due chiamate get distinte a seconda del content che può essere singolo o una collection
  Una volta ottenuto il contentResponse, chiamo il metodo setContentData che assegna l'intero risultato della richiesta
  CHiamando setContentEntries prendo solo la parte .data del risultato della richiesta, essa conterrà i valori di ciascun campo

  To-Do: unificare i due Set prendendo solo la parte .data
  */
  const getContentData = async () => {
    let contentResponse;
    if (variabiles.isSingleType) {
      contentResponse = await get(`/content-manager/single-types/${variabiles.slug}`);
    } else {
      contentResponse = await get(`/content-manager/collection-types/${variabiles.slug}/${id}`);
    }
    setContentData(contentResponse.data);
    setContentEntries(Object.entries(contentResponse.data));
    //localStorage.setItem('contentEntries', JSON.stringify(contentEntries));

  };

  /*
  Con questo metodo effettuo una chiamata get al fine di ottenere la struttura del content type che sto visualizzando
  Una volta ottenuto lo schemaResponse, chiamo il metodo setSchemaData che assegna la sezione .schema della risposta
  Chiamando setSchemaEntries prendo solo la parte relativa agli attributi dello schema poichè a me interessa un contenuto come title : string
  To-Do: unificare i due Set prendendo solo la parte .data
  */
  const getSchemaData = async () => {
    const schemaResponse = await get(`/content-type-builder/content-types/${variabiles.slug}`);
    setSchemaData(schemaResponse.data.data.schema);
    setSchemaEntries(Object.entries(schemaResponse.data.data.schema.attributes));
   // localStorage.setItem('schemaEntries', JSON.stringify(schemaEntries));
    setIsDataLoaded(true);

  };

  //metodo utilizzato per chiamare i due get 
  const openPreview = async () => {
    await getContentData();
    await getSchemaData();

    /*
    To-do: l'utente al momento deve necessariamente cliccare due volte una volta per caricare i dati ed una che apre il link con i dati
    a
    */
      if (isDataLoaded) {
        localStorage.setItem('contentEntries', JSON.stringify(contentEntries));
        localStorage.setItem('schemaEntries', JSON.stringify(schemaEntries));
        window.open('/admin/plugins/static-web-page-gen', '_blank');
        setIsDataLoaded(false);
      }

  };

  return (
    <div>
      <LinkButton
        size="S"
        startIcon={<Eye />}
        style={{ width: '100%' }}
        onClick={openPreview}
        
        variant="secondary"
      >
        Open Template Page
      </LinkButton>

    </div>
  );
};

export default CodeGenerator;

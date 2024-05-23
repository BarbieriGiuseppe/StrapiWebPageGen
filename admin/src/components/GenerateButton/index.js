import React, { useState } from 'react';
import { useCMEditViewDataManager, useFetchClient } from '@strapi/helper-plugin';
import Eye from '@strapi/icons/Eye';
import { LinkButton } from '@strapi/design-system/LinkButton';

const CodeGenerator = () => {
  const { get } = useFetchClient();
  const { initialData } = useCMEditViewDataManager();
  const variabiles = useCMEditViewDataManager();
  const [contentData, setContentData] = useState(null);
  const [schemaData, setSchemaData] = useState(null);
  const [contentEntries, setContentEntries] = useState([]);
  const [schemaEntries, setSchemaEntries] = useState([]);
  const id = window.location.pathname.split('::')[1].split('/')[1];

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
  };

  //metodo utilizzato per chiamare i due get 
  const openPreview = async () => {
    await getContentData();
    await getSchemaData();
  };

  //serve per stampare i div, da eliminare 
  const renderField = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item, index) => (
          <div key={`${key}-${index}`}>
            {Object.entries(item).map(([subKey, subValue]) => renderField(subKey, subValue))}
          </div>
        ));
      }
      return Object.entries(value).map(([subKey, subValue]) => renderField(subKey, subValue));
    }
    return (
      <div key={key}>
        <strong>{key}:</strong> {value}
      </div>
    );
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
      {contentData && (
        <div>
          <h2>Content Data</h2>
          {contentEntries.map(([key, value]) => renderField(key, value))}
        </div>
      )}
      {schemaData && (
        <div>
          <h2>Schema Data</h2>
          {schemaEntries.map(([key, value]) => (
            <div key={key}>
              <strong>{key}</strong>: {value.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;

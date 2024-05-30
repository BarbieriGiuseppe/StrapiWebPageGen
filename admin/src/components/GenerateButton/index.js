import React, { useState, useEffect } from "react";
import {
  useCMEditViewDataManager,
  useFetchClient,
} from "@strapi/helper-plugin";
import Eye from "@strapi/icons/Eye";
import { LinkButton } from "@strapi/design-system/LinkButton";

const CodeGenerator = () => {
  const { get } = useFetchClient();
  const { initialData } = useCMEditViewDataManager();
  const variabiles = useCMEditViewDataManager();
  const [contentData, setContentData] = useState([]);
  const [schemaData, setSchemaData] = useState([]);
  const id = window.location.pathname.split("::")[1].split("/")[1];
  const [combinedData, setCombinedData] = useState([]);
  const [componentsData, setComponentsData] = useState([]);

  if (initialData.publishedAt || initialData.slug == null) {
    //se il content type è in stato published o non ha uno slug
    return null; //non mostrare il bottone
  }

  /**
  Con questo metodo effettuo due chiamate get distinte a seconda del content che può essere singolo o una collection
  Una volta ottenuto il contentResponse, chiamo il metodo setContentData che assegna l'intero risultato della richiesta
  CHiamando setContentEntries prendo solo la parte .data del risultato della richiesta, essa conterrà i valori di ciascun campo
  */
  const getContentData = async () => {
    let contentResponse;
    if (variabiles.isSingleType) {
      contentResponse = await get(
        `/content-manager/single-types/${variabiles.slug}`
      );
    } else {
      contentResponse = await get(
        `/content-manager/collection-types/${variabiles.slug}/${id}`
      );
    }
    setContentData(Object.entries(contentResponse.data));
  };

  /** 
  Con questo metodo effettuo una chiamata get al fine di ottenere la struttura del content type che sto visualizzando
  Una volta ottenuto lo schemaResponse, chiamo il metodo setSchemaData che assegna la sezione .schema della risposta
  Chiamando setSchemaEntries prendo solo la parte relativa agli attributi dello schema poichè a me interessa un contenuto come title : string
  */
  const getSchemaData = async () => {
    const schemaResponse = await get(
      `/content-type-builder/content-types/${variabiles.slug}`
    );
    setSchemaData(Object.entries(schemaResponse.data.data.schema.attributes));
  };

  /**
   * Con questo metodo prendo in input l'intero layout dei components
   * definisco un array updatedComponentsData e mediante due cicli for itero sugli array components ed il sotto array attributes
   * al fine di unire il nome del component e gli attributi poichè sono gli unici dati che mi interessano
   */
  const getComponentData = () => {
    const components = variabiles.allLayoutData.components;
    let updatedComponentsData = [];

    for (let [componentName, componentData] of Object.entries(components)) {
      const attributes = {};

      for (let [attributeName, attributeData] of Object.entries(
        componentData.attributes
      )) {
        attributes[attributeName] = {
          type: attributeData.type,
        };
      }

      updatedComponentsData.push({
        name: componentName,
        attributes: attributes,
      });
    }

    // Aggiorno lo state con i nuovi dati
    setComponentsData(updatedComponentsData);
    console.log(updatedComponentsData);
  };

  /**
   * Questo metodo serve ad unire i due array contentData e schemaData iterando su di essi e filtrando il contenuto
   * inserendo nel terzo array solo elementi con le stesse chiavi.
   * Il combinedArray avra come struttura: "nome" "tipo" "valore"
   * @returns l'array combinato
   */
  const joinData = () => {
    if (!schemaData.length || !contentData.length) {
      return;
    }

    const schemaMap = new Map(
      schemaData.map(([key, value]) => [key, value.type])
    );

    const combinedArray = contentData
      .filter(([key]) => schemaMap.has(key))
      .map(([key, value]) => ({
        name: key,
        type: schemaMap.get(key),
        value: value,
      }));

    setCombinedData(combinedArray);

    console.log("Combined Data:", combinedArray);

    combinedArray.forEach((item) => {
      //itero su ciascun item del combinedArray
      if (item.value && Array.isArray(item.value)) {
        //se ha un valore ed è un array
        item.value.forEach((subItem) => {
          //itero nuovamente nel sotto array
          if (subItem.__component) {
            //se nel sotto array è presente ___component
            // Controlla se c'è un componente con lo stesso nome di __component di subItem
            //cerco all'interno di componentsData le occorrenze con il sotto array cioè deve combaciare il nome in combinedArray con il ___component in ComponentsData
            const matchingComponent = componentsData.find(
              (component) => component.name === subItem.__component
            );
            if (matchingComponent) {
              //se è presente un match
              // Aggiungo il tipo del componente
              const attributeTypes = Object.entries(
                matchingComponent.attributes
              ).map(([key, value]) => ({ [key]: value.type }));
              subItem.__component = attributeTypes;
            } //else {
            //console.log("Nessuna corrispondenza per", subItem.__component);
            // }
          }
        });
      }
    });

    return combinedArray;
  };

  //metodo utilizzato per chiamare i due get
  const openPreview = async () => {
    await getContentData();
    await getSchemaData();
    getComponentData();

    const combinedArray = joinData();

    if (combinedArray && combinedArray.length > 0) {
      localStorage.setItem("combinedData", JSON.stringify(combinedArray));
      window.open("/admin/plugins/static-web-page-gen", "_blank");
    }
  };

  return (
    <div>
      <LinkButton
        size="S"
        startIcon={<Eye />}
        style={{ width: "100%" }}
        onClick={openPreview}
        variant="secondary"
      >
        Open Template Page
      </LinkButton>
    </div>
  );
};

export default CodeGenerator;

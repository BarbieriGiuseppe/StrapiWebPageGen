import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const HomePage = () => {
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    // Prendo combinedData dal local storage
    const combData = localStorage.getItem("combinedData");
    if (combData) {
      //se sono presenti dei dati
      setCombinedData(JSON.parse(combData));
    }

    // pulisco il  localStorage dopo aver caricato i dati per evitare di mantenere i dati dopo il refresh
    localStorage.removeItem("combinedData");
  }, []);

  //metodo per gestire il contentType "block". Esso è un richtext che supporta diverse tipologie di formattazioni ed anche multimedia
  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return block.children.map((child, childIndex) => (
          <ReactMarkdown key={`${index}-${childIndex}`}>{child.text}</ReactMarkdown>
        ));

      case 'image':
        return (
          <img
            key={index}
            src={block.image.formats?.thumbnail?.url || block.image.url}
            alt={block.image.alternativeText || 'image'}
          />
        );

      case 'heading':
        const HeadingTag = `h${block.level}`;
        return block.children.map((child, childIndex) => (
          <HeadingTag key={`${index}-${childIndex}`}>{child.text}</HeadingTag>
        ));

      case 'list':
        // Determina se la lista è ordinata (ol) o non ordinata (ul) basandosi sul formato specificato nel blocco
        const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={index}>
            {block.children.map((listItem, listItemIndex) => (
              <li key={`${index}-${listItemIndex}`}>
                {listItem.children.map((child, childIndex) => (
                  <span key={`${index}-${listItemIndex}-${childIndex}`}>{child.text}</span>
                ))}
              </li>
            ))}
          </ListTag>
        );

      default:
        return null;
    }
  };

  // Funzione che mi consente di mostrare il contenuto in html di un component in base al suo tipo
  function renderDynamicZoneValue(
    componentType,
    componentValue,
    key,
    dynamicIndex,
    index
  ) {
    switch (componentType) {
      case "richtext": //se si tratta di un richtext ad esempio una descrizione, può contenere diverse tipologie di testo quindi utilizzo ReactMarkdown
        return (
          <ReactMarkdown
            key={`${dynamicIndex}-${index}`}
            children={componentValue}
          />
        );
      case "string": //se si tratta di un titolo o di una string
        return <p key={`${dynamicIndex}-${index}`}>{componentValue}</p>;
      case "media": //se si tratta di un media (img, video ecc)
        return (
          <img
            key={`${dynamicIndex}-${index}`}
            src={componentValue.url}
            alt={componentValue.alt}
          />
        );
      case "text":
        return (
          <ReactMarkdown
            key={`${dynamicIndex}-${index}`}
            children={componentValue}
          />
        );
      case "boolean": //se si tratta di un booleano (in genere un bottone) mostro il valore sotto forma di bottone
        return (
          <button>
            {" "}
            key={`${dynamicIndex}-${index}`} children={componentValue}{" "}
          </button>
        );
      default:
        // Handle unknown component types
        return null;
    }
  }

  const generateHTML = () => {
    return combinedData.map((element, index) => {
      let item;

      // Utilizzo uno switch per determinare di quale tipologia si tratta e quale codice html generare
      switch (element.type) {
        /* Qui gestisco i components composti da un singolo tipo (string, media, uid,boolean ecc.) */

        case "string": //se si tratta di un titolo o di una string
          if (element.value != null) {
            item = <p>{element.value}</p>; //crea un paragrafo
          }
          break;
        case "richtext": //se si tratta di un richtext ad esempio una descrizione, può contenere diverse tipologie di testo quindi utilizzo ReactMarkdown
          if (element.value != null) {
            item = <ReactMarkdown key={index}>{element.value}</ReactMarkdown>;
          }
          break;

        case "text": //se si tratta di testo ad esempio una descrizione, può contenere diverse tipologie di testo quindi utilizzo ReactMarkdown
          if (element.value != null) {
            item = <ReactMarkdown key={index}>{element.value}</ReactMarkdown>;
          }
          break;

        case "datetime": //se si tratta di un titolo o di una string
          if (element.value != null) {
            item = <p>{element.value}</p>; //crea un paragrafo
          }
          break;

        case "boolean": //se si tratta di un booleano (in genere un bottone) mostro il valore sotto forma di bottone
          item = <button>{element.value}</button>;
          break;

        case "media": //se si tratta di un media (img, video ecc)
          if (element.value != null) {
            if (Array.isArray(element.value)) {
              item = element.value.map((mediaItem, mediaIndex) => (
                <img
                  key={mediaIndex}
                  src={mediaItem.formats?.thumbnail?.url || mediaItem.url}
                  alt={mediaItem.name || "media"}
                />
              ));
            } else {
              item = (
                <img
                  key={index}
                  src={
                    element.value.formats?.thumbnail?.url || element.value.url
                  }
                  alt={element.value.name || "media"}
                />
              );
            }
          }
          break;

        case "uid": //se si tratta di un uid (slug) non mostrare nulla
          break;
        case "relation": // If it is a relation, display the title if value is an array
          if (element.value != null && Array.isArray(element.value)) {
            item = element.value.map((relationItem, relationIndex) => (
              <p key={relationIndex}>{relationItem.title}</p>
            ));
          } else {
            item = null; // Or handle the case where value is not an array
          }
          break;

        /* Da qui gestisco i contenuti dinamici o i blocchi */

        case 'blocks':
          if (element.value != null) {
            if (Array.isArray(element.value)) {
              item = element.value.map((block, blockIndex) =>
                renderBlock(block, blockIndex)
              );
            } else {
              item = <p>Invalid block data {element.type}</p>;
            }
          }
          break;

        case "dynamiczone":
          // Controlla se element.value non è nullo e se è un array
          if (element.value != null && Array.isArray(element.value)) {
            // Filtra i component per tiologia
            const richtextComponents = element.value.filter((dynamicItem) =>
              dynamicItem.__component.find((component) =>
                ["richtext", "string", "media", "text"].includes(
                  Object.values(component)[0]
                )
              )
            );

            // Ora elabora i component filtrati
            item = richtextComponents.map((dynamicItem, dynamicIndex) => {
              // Itera su tutte le chiavi di dynamicItem
              const keys = Object.keys(dynamicItem);
              const components = keys.map((key, index) => {
                // ignoro '__component' e 'id'
                if (key === "__component" || key === "id") return null;
                // elaboro ciascuna chiave per il suo tipo
                const componentType = dynamicItem.__component.find(
                  (component) => Object.keys(component)[0] === key)?.[key];
                const componentValue = dynamicItem[key];
                //chiamo il metodo per mostrare a schermo il codice html di quel content
                return renderDynamicZoneValue(
                  componentType,
                  componentValue,
                  key,
                  dynamicIndex,
                  index
                );
              });
              return <div key={dynamicIndex}>{components}</div>;
            });
          }
          break;

        default:
          return null; //se il tipo è sconosciuto non mostrare niente
      }

      return <div key={index}>{item}</div>;
    });
  };

  //da aggiungere una funzione dove sarà possibile selezionare dei file css da applicare al html generato
  return (
    <div>
      <select>
        <option value="" selected disabled hidden>
          Scegli il tema da applicare
        </option>
        <option value="1">One</option>
      </select>
      {generateHTML()}
    </div>
  );
};

export default HomePage;

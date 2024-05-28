import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const HomePage = () => {
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    // Retrieve combinedData from Local Storage
    const combData = localStorage.getItem('combinedData');
    if (combData) {
      setCombinedData(JSON.parse(combData));
    }

    // Clear localStorage after retrieving data to avoid keeping data on page refresh
    localStorage.removeItem('combinedData');
  }, []);

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return block.children.map((child, childIndex) => (
          <p key={`${index}-${childIndex}`}>{child.text}</p>
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

  const renderDynamicZone = (zone, index) => {
    return zone.value.map((component, componentIndex) => {
      switch (component.__component) {
        case 'shared.rich-text':
          return (
            <ReactMarkdown key={`${index}-${componentIndex}`}>
              {component.body}
            </ReactMarkdown>
          );
        // Add cases for other types of components
        default:
          return <p key={`${index}-${componentIndex}`}>Unknown component</p>;
      }
    });
  };


  const generateHTML = () => {
    return combinedData.map((element, index) => {
      let item;

      // Utilizzo uno switch per determinare di quale tipologia si tratta e quale codice html generare
      switch (element.type) {
        /* Qui gestisco i components composti da un singolo tipo (string, media, uid,boolean ecc.) */
        
          case 'string': //se si tratta di un titolo o di una string
          if(element.value!= null){
            item = <p>{element.value}</p>; //crea un paragrafo
          }
          break;
          case 'richtext': //se si tratta di un richtext ad esempio una descrizione, può contenere diverse tipologie di testo quindi utilizzo ReactMarkdown
            if(element.value!= null){
            item = <ReactMarkdown key={index}>{element.value}</ReactMarkdown>;
            }
            break;

          case 'text': //se si tratta di testo ad esempio una descrizione, può contenere diverse tipologie di testo quindi utilizzo ReactMarkdown
            if(element.value!= null){
            item = <ReactMarkdown key={index}>{element.value}</ReactMarkdown>;
              }
            break;
          case 'boolean': //se si tratta di un booleano (in genere un bottone) mostro il valore sotto forma di bottone
            item = <button>{element.value}</button>;
          break;

          case 'media': //se si tratta di un media (img, video ecc) 
            if (element.value != null) {
              if (Array.isArray(element.value)) {
                item = element.value.map((mediaItem, mediaIndex) => (
                  <img
                    key={mediaIndex}
                    src={mediaItem.formats?.thumbnail?.url || mediaItem.url}
                    alt={mediaItem.name || 'media'}
                  />
                ));
              } else {
                item = (
                  <img
                    key={index}
                    src={element.value.formats?.thumbnail?.url || element.value.url}
                    alt={element.value.name || 'media'}
                  />
                );
              }
            }
            break;

            case 'uid': //se si tratta di un uid (slug) non mostrare nulla
            break;
          case 'relation': // If it is a relation, display the title if value is an array
              if (element.value != null && Array.isArray(element.value)) {
                item = element.value.map((relationItem, relationIndex) => (
                  <p key={relationIndex}>{relationItem.title}</p>
                ));
              } else {
                item = null; // Or handle the case where value is not an array
              }
            break;

            /* Da qui gestisco i contenuti dinamici o i blocchi */
            case 'dynamiczone':
              if (element.value != null) {
                item = renderDynamicZone(element, index);
              }
              break;

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
          case 'component':
            if (element.value != null) {
              if (Array.isArray(element.value)) {
                item = <p>eee</p>;
                
              } else {
                item = <p>Invalid block data {element.type}</p>;
              }
            }
            break;
            
         
        default:
          if(element.value!= null){
          item = <p>{element.type}</p>; // Default definition if the type does not match
          }
          break;
      }

      return (
        <div key={index}>
          {item}
        </div>
      );
    });
  };

  //da aggiungere una funzione dove sarà possibile selezionare dei file css da applicare al html generato
  return (
    <div>
      <select>
       <option value="" selected disabled hidden>Scegli il tema da applicare</option>
       <option value="1">One</option>

      </select>
      {generateHTML()}
    </div>
  );
};

export default HomePage;

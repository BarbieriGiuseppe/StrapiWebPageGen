import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useFetchClient } from "@strapi/helper-plugin";

const TemplatePage = () => {
  const { get } = useFetchClient();
  const [combinedData, setCombinedData] = useState([]); 
  const [stylingFiles, setStylingFiles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [error, setError] = useState(null);
  const hostName = window.location.hostname;
  const port = window.location.port;

  useEffect(() => {
    const combData = localStorage.getItem("combinedData"); //prendo i dati passati da GenerateButton nel localStorage
    if (combData) { //se sono presenti
      setCombinedData(JSON.parse(combData));
      localStorage.removeItem("combinedData"); //li rimuovo una volta caricati
    }
    getStylingFiles(); //chiamo la funzione per caricare i temi
  }, []);

  const getStylingFiles = async () => { //funzione asincrona che mi ritorna i temi presenti nel media library
    try {
      const response = await get(`/upload/files?&_q=.css`); //eseguo una chiamata di tipo GET al media library di Strapi filtrando i soli file in formato .css
      setStylingFiles(response.data.results); //imposto la variabile di stato con i temi trovati
    } catch (error) { //in caso di errore 
      console.error("Errore nel fetching dei file di styling:", error);
      setError("Failed to load styling files.");
    }
  };

  const getSelectedFile = (fileName) => { //imposto il tema selezionato
    setSelectedTheme(fileName);
  };

  useEffect(() => {
    if (selectedTheme) { //se viene selezionato un tema, importa quest'ultimo nella sezione head dell'HTML
      const link = document.createElement("link");
      link.href = `http://${hostName}:${port}${selectedTheme}`;
      link.rel = "stylesheet";
      link.type = "text/css";
      document.head.appendChild(link);

      return () => {
        link.remove();
      };
    }
  }, [selectedTheme]);

  const handleResetClick = () => { //al click del pulsante ripristina, rimuovi il tema applicato
    setSelectedTheme("");
  };

  /**
   * 
   * @param {*} block 
   * @param {*} index 
   * @returns 
   */
  const renderBlock = (block, index) => {
    switch (block.type) {
      case "paragraph":
      case "text":
        return block.children.map((child, childIndex) => (
          <ReactMarkdown key={`${index}-${childIndex}`} className={`${block.name}`}>
            {child.text}

          </ReactMarkdown>
        ));
      case "image":
        return (
          <img
            key={index}
            src={block.image.formats?.thumbnail?.url || block.image.url}
            alt={block.image.alternativeText || "image"}
            className={`${block.name}`}
          />
        );
      case "heading":
        const HeadingTag = `h${block.level}`;
        return block.children.map((child, childIndex) => (
          <HeadingTag key={`${index}-${childIndex}`} className={`${block.name}`}>{child.text}</HeadingTag>
        ));
      case "list":
        const ListTag = block.format === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={index} className={`${block.name}`}>
            {block.children.map((listItem, listItemIndex) => (
              <li key={`${index}-${listItemIndex}`}>
                {listItem.children.map((child, childIndex) => (
                  <span key={`${index}-${listItemIndex}-${childIndex}`}>
                    {child.text}
                  </span>
                ))}
              </li>
            ))}
          </ListTag>
        );
      default:
        return null;
    }
  };

  /**
   * 
   * @param {*} componentType 
   * @param {*} componentValue 
   * @param {*} key 
   * @param {*} dynamicIndex 
   * @param {*} index 
   * @returns 
   */
  const renderDynamicZoneValue = (
    componentType,
    componentValue,
    key,
    dynamicIndex,
    index
  ) => {
    switch (componentType) {
      case "richtext":
      case "text":
        return (
          <ReactMarkdown key={`${dynamicIndex}-${index}`}
            className={`${key}`}
          >
            {componentValue}
          </ReactMarkdown>
        );
      case "string":
        return <p key={`${dynamicIndex}-${index}`} className={`${key}`}>{componentValue}</p>;
      case "datetime":
        return <p key={`${dynamicIndex}-${index}`} className={`${key}`}>{componentValue}</p>;
      case "media":
        return (
          <img
            key={`${dynamicIndex}-${index}`}
            src={componentValue.url}
            alt={componentValue.alt}
            className={`${key}`}
          />
        );
      case "boolean":
        return (
          <button key={`${dynamicIndex}-${index}`}
            className={`${key}`}
          >
            {componentValue}
          </button>
        );
      default:
        return null;
    }
  };

  /**
   * Questo è il metodo principale, si occupa della generazione dell'html 
   * degli elementi non innestati o non facenti parte di ulteriori array come i blocchi o dyn zone
   * 
   * @returns l'html appropriato
   */
  const generateHTML = () => {
    return combinedData.map((element, index) => {
      let item;

      switch (element.type) {
        case "string": //utilizzo ReactMarkdown per gestire automaticamente eventuale testo formattato
          item = <ReactMarkdown key={index} className={`${element.name}`}>{element.value}</ReactMarkdown>;
        case "datetime":
          item = <ReactMarkdown key={index} className={`${element.name}`}>{element.value}</ReactMarkdown>;
          break;
        case "richtext":
        case "text":
          item = (
            <ReactMarkdown key={index}
              className={`${element.name}`}
            >
              {element.value}
            </ReactMarkdown>
          );
          break;
        case "boolean": // i boolean sono trattati come bottoni
          item = <button key={index}
            className={`${element.name}`}

          >{element.value}</button>;
          break;
        case "media": //per i media mi serve l'url del media affinchè venga mostrato, viene trattato con img
          item = Array.isArray(element.value) ? element.value.map((mediaItem, mediaIndex) => (
            <img
              key={mediaIndex}
              src={mediaItem.formats?.thumbnail?.url || mediaItem.url}
              alt={mediaItem.name || "media"}
              className={`${element.name}`}

            />
          )) : (
            <img
              key={index}
              src={element.value.formats?.thumbnail?.url || element.value.url}
              alt={element.value.name || "media"}
              className={`${element.name}`}
            />
          );
          break;
        case "uid": // non mostare
          break;
        case "relation":
          item = Array.isArray(element.value) ? element.value.map((relationItem, relationIndex) => (
            <p key={relationIndex} >{relationItem.title}</p>
          )) : null;
          break;
        case "blocks": // rimanda alla funzione renderBlock, altrimenti mostra Invalid block data
          item = Array.isArray(element.value) ? element.value.map((block, blockIndex) => (
            renderBlock(block, blockIndex)
          )) : <p key={index}>Invalid block data {element.type}</p>;
          break;
        case "dynamiczone": // rimanda alla funzione renderDynamicZoneValue
          item = Array.isArray(element.value) ? element.value.map((dynamicItem, dynamicIndex) => {
            const components = Object.keys(dynamicItem).map((key, idx) => {
              if (key === "__component" || key === "id") return null;
              const componentType = dynamicItem.__component.find(
                component => Object.keys(component)[0] === key
              )?.[key];
              return renderDynamicZoneValue(
                componentType,
                dynamicItem[key],
                key,
                dynamicIndex,
                idx
              );
            });
            return <div key={dynamicIndex}>{components}</div>;
          }) : null;
          break;
        default:
          return null;
      }

      return <div key={index}>{item}</div>;
    });
  };

  //Styling del bottone ripristina e della tab dei temi
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px',
    },
    select: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '100%',
      boxSizing: 'border-box',
    },
    option: {
      fontSize: '16px',
    },
    button: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      margin: '10px 0',
    },
  };

  if (error) return <p>{error}</p>; // se si verifica un errore aggiungi un paragrafo con il valore dell'errore

  return (
    <body className="generatedBody">
      <div className="generated">
        <div style={styles.container}>
          <select
            style={styles.select}
            onChange={(event) => getSelectedFile(event.target.value)}
            defaultValue=""
          >
            <option value="" disabled hidden style={styles.option}>
              Scegli il tema da applicare
            </option>
            {stylingFiles.map((file) => (
              <option key={file.id} value={file.url} style={styles.option}>
                {file.name}
              </option>
            ))}
          </select>
          <button onClick={handleResetClick} style={styles.button}>
            Ripristina
          </button>
        </div>
        {generateHTML()}
      </div>
    </body>
  );
};

export default TemplatePage;

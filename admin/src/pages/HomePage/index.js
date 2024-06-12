import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useFetchClient } from "@strapi/helper-plugin";

const HomePage = () => {
  const { get } = useFetchClient();
  const [combinedData, setCombinedData] = useState([]);
  const [stylingFiles, setStylingFiles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [error, setError] = useState(null);
  const hostName = window.location.hostname;
  const port = window.location.port;

  useEffect(() => {
    const combData = localStorage.getItem("combinedData");
    if (combData) {
      setCombinedData(JSON.parse(combData));
      localStorage.removeItem("combinedData");
    }
    getStylingFiles();
  }, []);

  const getStylingFiles = async () => {
    try {
      const response = await get(`/upload/files?&_q=.css`);
      setStylingFiles(response.data.results);
    } catch (error) {
      console.error("Errore nel fetching dei file di styling:", error);
      setError("Failed to load styling files.");
    } 
  };

  const getSelectedFile = (fileName) => {
    setSelectedTheme(fileName);
  };

  useEffect(() => {
    if (selectedTheme) {
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

  const handleResetClick = () => {
    setSelectedTheme("");
  };

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

  const generateHTML = () => {
    return combinedData.map((element, index) => {
      let item;

      switch (element.type) {
        case "string":
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
        case "boolean":
          item = <button key={index}
          className={`${element.name}`}

          >{element.value}</button>;
          break;
        case "media":
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
        case "uid":
          break;
        case "relation":
          item = Array.isArray(element.value) ? element.value.map((relationItem, relationIndex) => (
            <p key={relationIndex} >{relationItem.title}</p>
          )) : null;
          break;
        case "blocks":
          item = Array.isArray(element.value) ? element.value.map((block, blockIndex) => (
            renderBlock(block, blockIndex)
          )) : <p key={index}>Invalid block data {element.type}</p>;
          break;
        case "dynamiczone":
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

  if (error) return <p>{error}</p>;

  return (
    <body className= "generatedBody">
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

export default HomePage;

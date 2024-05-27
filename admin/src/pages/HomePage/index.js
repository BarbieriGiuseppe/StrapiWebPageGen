import React, { useState, useEffect } from 'react';
import pluginId from '../../pluginId';

const HomePage = () => {

  const [combinedData,setCombinedData] = useState([]);

  useEffect(() => {
    // Recupera combinedData dal Local Storage
    const combData = localStorage.getItem('combinedData')
    if (combData) {
      setCombinedData(JSON.parse(combData));
    }

        // pulisco del localStorage dopo aver recuperato i dati cosi che al refresh della pagina non rimangano salvati i dati
        localStorage.removeItem('combinedData');
  }, []);

  return (
    <div>
      <h3>Template Pagina Web</h3>
      <ul>
        {combinedData.map((element, index) => (
          <li key={index}>{`Title: ${element.name}, Type: ${element.type}, Value: ${JSON.stringify(element.value)}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;



/*
import React, { useState, useEffect } from 'react';
import pluginId from '../../pluginId';

const HomePage = () => {
  const [combinedEntries, setCombinedEntries] = useState([]);

  useEffect(() => {
    // Recupera combinedEntries dal Local Storage
    const storedCombinedEntries = localStorage.getItem('combinedEntries');

    if (storedCombinedEntries) {
      setCombinedEntries(JSON.parse(storedCombinedEntries));
    }

    // Pulisce il localStorage dopo aver recuperato i dati
    localStorage.removeItem('combinedEntries');
  }, []);

  const generateHTML = () => {
    return combinedEntries.map(([key, contentValue, schemaValue]) => {
      let element;

      // Determina il tipo di elemento HTML in base al tipo dello schema
      switch (schemaValue.type) {
        case 'string':
          element = <h1>{contentValue}</h1>;
          break;
        case 'media':
          element = <img src={contentValue.url} alt={contentValue.alt} />;
          break;
        // Aggiungi altri casi per altri tipi di dati se necessario
        default:
          element = <p>{contentValue}</p>; // Definizione predefinita nel caso in cui il tipo non corrisponda
          break;
      }

      return (
        <div key={key}>
          <p><strong>{key}:</strong></p>
          {element}
        </div>
      );
    });
  };

  return (
    <div>
      {generateHTML()}
    </div>
  );
};

export default HomePage;

*/
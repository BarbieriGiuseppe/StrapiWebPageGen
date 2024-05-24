import React, { useState, useEffect } from 'react';
import pluginId from '../../pluginId';

const HomePage = () => {
  const [contentEntries, setContentEntries] = useState([]);
  const [schemaEntries, setSchemaEntries] = useState([]);

  useEffect(() => {
    // Recupera schemaEntries dal Local Storage
    const cEntries = localStorage.getItem('contentEntries');
    const sEntries = localStorage.getItem('schemaEntries');
    if (cEntries && sEntries) {
      setContentEntries(JSON.parse(cEntries));
      setSchemaEntries(JSON.parse(sEntries));
    }

        // Pulizia del localStorage dopo aver recuperato i dati
        localStorage.removeItem('contentEntries');
        localStorage.removeItem('schemaEntries');
  }, []);

  return (
    <div>
      <h1>{pluginId}&apos;s HomePage</h1>

        {schemaEntries.map(([key, value]) => (
          <div key={key}>
            <strong>{key}</strong>: {value.type}
          </div>
        ))} 

      {contentEntries.map(([key, value]) => (
        <div key={key}>
          <strong>{key}</strong>: {typeof value === 'object' ? JSON.stringify(value) : value}
        </div>
      ))}
    </div>
  );
};

export default HomePage;

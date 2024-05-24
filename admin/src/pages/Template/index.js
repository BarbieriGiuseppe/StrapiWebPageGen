/*
 *
 * HomePage
 *
 */

import React,{useState} from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';


const Template = () => {
  const [schemaEntries, setSchemaEntries] = useState([]);

  return (
    <div>
      <h1>{pluginId}&apos;s HomePage</h1>
      <button>
        {schemaEntries} a
        </button>
    </div>
  );
};

export default Template;

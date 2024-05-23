/*
 *
 * HomePage
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';


const Template = () => {
  return (
    <div>
      <h1>{pluginId}&apos;s HomePage</h1>
      <button>
        cliccami
        </button>
    </div>
  );
};

export default Template;

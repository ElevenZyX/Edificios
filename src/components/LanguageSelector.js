import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import EnglishFlag from "../img/english.png";
import SpanishFlag from "../img/español.png";

function LanguageSelector() {
  const { t } = useTranslation(); // Access translation function

  const changeLanguage = (language) => {
    i18n.changeLanguage(language); // Use i18n from the context
  };

  return (
    <div className='mt-5 mx-3'>
      <select 
        onChange={(e) => changeLanguage(e.target.value)}
        style={{ padding: '5px' }} // Agrega un padding al selector
      >
        <option value="en"> English </option>
        <option value="es"> Español </option>
      </select>
    </div>
  );
}

export default LanguageSelector;

import React from 'react'
import Select from "react-select";
import { LANGUAGES } from '../../constants/languages';
export default function LangugeDropdown({language,setLanguage}) {
  return (
    <Select
      placeholder={language.label}
      options={LANGUAGES}
      value={language.value}
      className="w-1/3"
      onChange={(e) => {
        setLanguage(e);
      }}
		/>
  )
}

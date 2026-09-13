import React from 'react';
import Select from "react-select";
import { LANGUAGES } from '../../constants/languages';

const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#333333',
    borderColor: state.isFocused ? '#666666' : '#444444',
    boxShadow: 'none',
    minHeight: '32px',
    height: '32px',
    borderRadius: '4px',
    fontSize: '13px',
    minWidth: '130px',
    cursor: 'pointer',
    '&:hover': { borderColor: '#555555' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 8px' }),
  singleValue: (base) => ({ ...base, color: '#e0e0e0' }),
  placeholder: (base) => ({ ...base, color: '#888888' }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#262626',
    border: '1px solid #444444',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 99999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3e3e3e' : state.isFocused ? '#333333' : 'transparent',
    color: state.isSelected ? '#ffa116' : '#e0e0e0',
    fontSize: '13px',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#444444' },
  }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px', color: '#888888' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export default function LanguageDropdown({ language, setLanguage }) {
  return (
    <Select
      placeholder={language?.label || "Select Language"}
      options={LANGUAGES}
      value={language}
      styles={darkSelectStyles}
      className="text-xs"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      onChange={(selected) => {
        if (selected) setLanguage(selected);
      }}
    />
  );
}

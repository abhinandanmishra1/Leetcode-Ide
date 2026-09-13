import React from 'react';
import Select from "react-select";
import { defineTheme } from "../../lib/defineTheme";
import monacoThemes from "monaco-themes/themes/themelist";

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
  menu: (base) => ({
    ...base,
    backgroundColor: '#2d2d2d',
    border: '1px solid #444444',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3e3e3e' : state.isFocused ? '#383838' : 'transparent',
    color: '#e0e0e0',
    fontSize: '13px',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#4a4a4a' },
  }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px', color: '#888888' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export default function ThemeDropdown({ theme, setTheme }) {
  function handleThemeChange(selected) {
    if (!selected) return;
    if (["light", "vs-dark"].includes(selected.value)) {
      setTheme(selected.value);
    } else {
      defineTheme(selected.value).then(() => setTheme(selected.value));
    }
  }

  const themeOptions = [
    { label: 'VS Dark', value: 'vs-dark' },
    { label: 'Light', value: 'light' },
    ...Object.entries(monacoThemes).map(([themeId, themeName]) => ({
      label: themeName,
      value: themeId,
    })),
  ];

  const currentOption = themeOptions.find((opt) => opt.value === theme) || {
    label: typeof theme === 'string' ? theme : 'VS Dark',
    value: typeof theme === 'string' ? theme : 'vs-dark',
  };

  return (
    <Select
      placeholder={currentOption.label}
      options={themeOptions}
      value={currentOption}
      styles={darkSelectStyles}
      className="text-xs"
      onChange={handleThemeChange}
    />
  );
}

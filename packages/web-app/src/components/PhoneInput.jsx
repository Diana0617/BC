import React from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';

/**
 * Componente reutilizable para input de teléfono con selección de país
 * Usa react-phone-number-input para validación y formato internacional
 */
const PhoneInput = ({ 
  value, 
  onChange, 
  disabled = false, 
  required = false,
  placeholder = "Número de teléfono",
  className = "",
  error = null
}) => {
  return (
    <div className="phone-input-container">
      <PhoneInputWithCountry
        international
        defaultCountry="CO"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`phone-input-wrapper ${className}`}
        numberInputProps={{
          className: `phone-number-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`,
          required: required
        }}
      />
      {error && (
        <p className="phone-input-error">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;

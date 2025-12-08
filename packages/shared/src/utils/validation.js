// Utils for form validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  // Basic phone validation - adjust regex as needed
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Form validation helper
export const createValidator = (rules) => {
  return (values) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = values[field];
      
      for (const rule of fieldRules) {
        if (rule.required && !validateRequired(value)) {
          errors[field] = rule.message || `${field} es requerido`;
          break;
        }
        
        if (value && rule.type === 'email' && !validateEmail(value)) {
          errors[field] = rule.message || 'Email inválido';
          break;
        }
        
        if (value && rule.type === 'password' && !validatePassword(value)) {
          errors[field] = rule.message || 'Contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial';
          break;
        }
        
        if (value && rule.type === 'phone' && !validatePhone(value)) {
          errors[field] = rule.message || 'Teléfono inválido';
          break;
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
          errors[field] = rule.message || `Mínimo ${rule.minLength} caracteres`;
          break;
        }
        
        if (value && rule.maxLength && value.length > rule.maxLength) {
          errors[field] = rule.message || `Máximo ${rule.maxLength} caracteres`;
          break;
        }
        
        if (rule.custom && !rule.custom(value, values)) {
          errors[field] = rule.message || 'Valor inválido';
          break;
        }
      }
    });
    
    return errors;
  };
};
// UK Postcode validation
export const isValidPostcode = (postcode: string): boolean => {
  // Basic UK postcode regex pattern
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic international format)
export const isValidPhone = (phone: string): boolean => {
  // Allows for international numbers with optional + and spaces
  const phoneRegex = /^[+]?[\s\d-]+$/;
  return phone === '' || phoneRegex.test(phone);
};

// Trade validation
export const isValidTrade = (trade: string, validTrades: string[]): boolean => {
  return validTrades.includes(trade);
};

// Form validation for the job description page
export const validateJobDescription = (description: string): { isValid: boolean; error?: string } => {
  if (!description.trim()) {
    return { isValid: false, error: 'Job description is required' };
  }
  
  if (description.length < 10) {
    return { isValid: false, error: 'Please provide more details about the job' };
  }
  
  return { isValid: true };
};

// Form validation for contact information
export const validateContactInfo = (email: string, phone: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (phone && !isValidPhone(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

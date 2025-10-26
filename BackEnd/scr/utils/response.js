/**
 * Utilidades para formato estándar de respuestas API
 */
export const responseUtils = {
  success: (data, message = 'Success') => ({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }),
  
  error: (message = 'Internal server error', code = 500, details = null) => ({
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    }
  }),
  
  validationError: (errors) => ({
    success: false,
    error: {
      message: 'Validation failed',
      code: 400,
      details: errors,
      timestamp: new Date().toISOString()
    }
  })
};
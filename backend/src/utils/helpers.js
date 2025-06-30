// Funciones utilitarias generales

exports.generarClaveAleatoria = () => {
  // Lógica para generar claves
  return Math.random().toString(36).slice(-8);
};

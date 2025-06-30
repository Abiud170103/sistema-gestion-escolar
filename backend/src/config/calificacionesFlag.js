// Estado global simple para habilitar/deshabilitar el sistema de calificaciones
let calificacionesHabilitadas = false;

module.exports = {
  get: () => calificacionesHabilitadas,
  set: (valor) => { calificacionesHabilitadas = valor; }
};

// Ejemplo de modelo de usuario
// Aquí puedes definir el esquema y funciones para interactuar con la base de datos

class Usuario {
  constructor(id, nombre, correo, rol) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.rol = rol;
  }
}

module.exports = Usuario;

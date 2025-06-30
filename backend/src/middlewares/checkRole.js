// Middleware para verificar el rol del usuario
// Se asume que el usuario ya está autenticado y su info está en req.user
module.exports = function(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({ error: 'No autenticado o token inválido' });
    }
    const rol = req.user.rol;
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
};

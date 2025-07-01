import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import Layout from './Layout';
import './Modal.css';

function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    nombre: '', usuario: '', correo: '', rol: '', contrasena: '', grupo: '', anio: '', alumno: '', estudiante_id: '', taller: '', matricula: '', homoclave: ''
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtros, setFiltros] = useState({ nombre: '', apellido: '', rol: '', grupo: '', anio: '', taller: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  async function fetchUsuarios() {
    setLoading(true);
    try {
      const data = await apiRequest('/usuarios', { method: 'GET' });
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openModal(user = null) {
    setEditUser(user);
    if (user) {
      setForm({ ...user, contrasena: '' });
    } else {
      setForm({ nombre: '', usuario: '', correo: '', rol: '', contrasena: '', grupo: '', anio: '', alumno: '', estudiante_id: '', taller: '', matricula: '', homoclave: '' });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditUser(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editUser) {
        // Enviar nombre, usuario, correo y rol (aunque rol esté deshabilitado)
        const payload = {
          nombre: form.nombre,
          usuario: form.usuario,
          correo: form.correo,
          rol: form.rol,
        };
        if (form.rol === 'docente') {
          payload.tipo_docente = form.tipo_docente || null;
        }
        await apiRequest(`/usuarios/${editUser.id_usuario || editUser.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setSuccess('Usuario editado correctamente.');
      } else {
        // Crear usuario
        if (form.rol === 'padre') {
          // Para padres, usar el endpoint especial que envía correos
          const padrePayload = {
            nombre: form.nombre,
            correo: form.correo,
            estudiante_id: parseInt(form.estudiante_id),
            homoclave: form.homoclave
          };
          
          console.log('Registrando padre con payload:', padrePayload);
          
          const result = await apiRequest('/padres/completo', { 
            method: 'POST', 
            body: JSON.stringify(padrePayload) 
          });
          
          console.log('Resultado registro padre:', result);
          
          if (result.correo_enviado) {
            setSuccess(`Padre registrado exitosamente. Se ha enviado un correo a ${form.correo} con las credenciales de acceso.`);
            if (result.preview_url) {
              console.log('Preview del correo:', result.preview_url);
            }
          } else {
            setSuccess('Padre registrado exitosamente, pero hubo un problema enviando el correo. Contacte al administrador.');
          }
        } else {
          // Para otros roles, usar el endpoint normal
          // Crear payload limpio solo con los campos necesarios
          const payload = {
            nombre: form.nombre,
            usuario: form.usuario,
            correo: form.correo,
            contrasena: form.contrasena,
            rol: form.rol
          };
          
          // Agregar campos específicos por rol
          if (form.rol === 'estudiante') {
            payload.grupo = form.grupo;
            payload.anio = form.anio;
            payload.matricula = form.matricula;
            
            // Validar formato de matrícula para estudiantes: C + 13 dígitos
            if (payload.matricula && !/^C\d{13}$/.test(payload.matricula)) {
              throw new Error('Formato de matrícula inválido. Debe ser: C seguido de 13 dígitos (ej: C1234567890123)');
            }
          }
          
          if (form.rol === 'docente') {
            payload.tipo_docente = form.tipo_docente;
          }
          
          console.log('Enviando payload limpio:', payload);
          await apiRequest('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
          setSuccess('Usuario creado correctamente.');
        }
      }
      closeModal();
      fetchUsuarios();
    } catch (err) {
      if (err && err.message) {
        setError(err.message);
      } else if (err && err.detalle) {
        setError(err.detalle);
      } else {
        setError('Error desconocido al crear/editar usuario');
      }
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
      setSuccess('Usuario eliminado correctamente.');
      setConfirmDelete(null);
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleFiltroChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  function filtrarUsuarios(usuarios) {
    return usuarios.filter(u => {
      const nombreMatch = filtros.nombre === '' || (u.nombre && u.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()));
      const apellidoMatch = filtros.apellido === '' || (u.apellido && u.apellido.toLowerCase().includes(filtros.apellido.toLowerCase()));
      const rolMatch = filtros.rol === '' || (u.rol && u.rol === filtros.rol);
      const grupoMatch = filtros.grupo === '' || (u.grupo && u.grupo.toLowerCase().includes(filtros.grupo.toLowerCase()));
      const anioMatch = filtros.anio === '' || (u.anio && String(u.anio).includes(filtros.anio));
      const tallerMatch = filtros.taller === '' || (u.taller && u.taller.toLowerCase().includes(filtros.taller.toLowerCase()));
      return nombreMatch && apellidoMatch && rolMatch && grupoMatch && anioMatch && tallerMatch;
    });
  }

  // Campos adicionales según rol
  function renderExtraFields() {
    if (form.rol === 'estudiante') {
      return (
        <>
          <div className="form-group">
            <label>Grupo</label>
            <input name="grupo" value={form.grupo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Año escolar</label>
            <input name="anio" value={form.anio} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Matrícula</label>
            <input 
              name="matricula" 
              value={form.matricula} 
              onChange={handleChange}
              placeholder="C1234567890123"
              pattern="^C\d{13}$"
              title="Formato: C seguido de 13 dígitos (ej: C1234567890123)"
              required
            />
            <small style={{color: '#666', fontSize: '12px'}}>
              Formato: C + 13 dígitos (ej: C1234567890123)
            </small>
          </div>
        </>
      );
    }    if (form.rol === 'padre' || form.rol === 'tutor') {
      return (
        <>
          <div className="form-group">
            <label>ID del Estudiante (requerido) *</label>
            <input 
              name="estudiante_id" 
              type="number"
              value={form.estudiante_id} 
              onChange={handleChange} 
              placeholder="Ej: 7, 8, 9..."
              required
            />
            <small style={{color: '#666', fontSize: '12px'}}>
              Ingrese el ID del estudiante hijo/a al que tutorará
            </small>
          </div>
          <div className="form-group">
            <label>Homoclave (requerida) *</label>
            <input 
              name="homoclave" 
              value={form.homoclave} 
              onChange={handleChange} 
              placeholder="Ej: 1AB, AB2, 3CD..."
              pattern="^((\d[A-Za-z]{2})|([A-Za-z]{2}\d))$"
              title="Formato: 1 dígito + 2 letras O 2 letras + 1 dígito"
              required
            />
            <small style={{color: '#666', fontSize: '12px'}}>
              Formato: 1 dígito + 2 letras (ej: 1AB) O 2 letras + 1 dígito (ej: AB2)
            </small>
          </div>
        </>
      );
    }
    if (form.rol === 'docente') {
      return (
        <div className="form-group">
          <label>Tipo de docente</label>
          <select name="tipo_docente" value={form.tipo_docente || ''} onChange={handleChange} required>
            <option value="">Selecciona tipo</option>
            <option value="BA">Docente frente a grupo (BA)</option>
            <option value="BB">Docente administrativo (BB)</option>
          </select>
        </div>
      );
    }
    return null;
  }

  // Determina qué columnas mostrar según el filtro de rol
  function getColumnasVisibles() {
    switch (filtros.rol) {
      case 'estudiante':
        return ['ID', 'Nombre', 'Correo', 'Rol', 'Grupo', 'Año', 'Matrícula', 'Acciones'];
      case 'docente':
        return ['ID', 'Nombre', 'Correo', 'Rol', 'Tipo de docente', 'Acciones'];
      case 'padre':
        return ['ID', 'Nombre', 'Correo', 'Rol', 'Estudiante a tutorar', 'Homoclave', 'Acciones'];
      case 'admin':
        return ['ID', 'Nombre', 'Correo', 'Rol', 'Acciones'];
      default:
        return ['ID', 'Nombre', 'Correo', 'Rol', 'Acciones'];
    }
  }

  function renderColumna(u, col) {
    switch (col) {
      case 'ID': return <td>{u.id_usuario || u.id}</td>;
      case 'Nombre': return <td>{u.nombre}</td>;
      case 'Correo': return <td>{u.correo}</td>;
      case 'Rol': return <td>{u.rol}</td>;
      case 'Grupo': return <td>{u.grupo || ''}</td>;
      case 'Año': return <td>{u.anio || ''}</td>;
      case 'Matrícula': return <td>{u.matricula || ''}</td>;
      case 'Tipo de docente': return <td>{u.tipo_docente || ''}</td>;
      case 'Estudiante a tutorar': return <td>{u.estudiante_id || ''}</td>;
      case 'Homoclave': return <td>{u.homoclave || ''}</td>;
      case 'Acciones':
        return <td>
          <button onClick={() => openModal(u)}>Editar</button>
          <button onClick={() => setConfirmDelete(u.id_usuario || u.id)}>Eliminar</button>
        </td>;
      default: return null;
    }
  }

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  return (
    <Layout title="Gestión de Usuarios">
      <div>
        {success && <div style={{color:'green', marginBottom:8}}>{success}</div>}
        {error && <div style={{color:'red', marginBottom:8}}>{error}</div>}
      <div style={{marginBottom:16, background:'#f5f5f5', padding:12, borderRadius:8, display:'flex', alignItems:'center', gap:16}}>
        <select name="rol" value={filtros.rol} onChange={handleFiltroChange} style={{minWidth:160}}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="docente">Docente</option>
          <option value="estudiante">Estudiante</option>
          <option value="padre">Padre/Tutor</option>
        </select>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:0}}>
          <input name="nombre" placeholder="Nombre" value={filtros.nombre} onChange={handleFiltroChange} />
          <input name="apellido" placeholder="Apellido" value={filtros.apellido} onChange={handleFiltroChange} />
          <input name="grupo" placeholder="Grupo" value={filtros.grupo} onChange={handleFiltroChange} />
          <input name="anio" placeholder="Año" value={filtros.anio} onChange={handleFiltroChange} />
          <input name="taller" placeholder="Taller" value={filtros.taller} onChange={handleFiltroChange} />
        </div>
      </div>
      <button onClick={() => openModal()}>Agregar usuario</button>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              {getColumnasVisibles().map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrarUsuarios(usuarios).map(u => (
              <tr key={u.id_usuario || u.id}>
                {getColumnasVisibles().map(col => renderColumna(u, col))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-bg">
          <form className="modal-form" onSubmit={handleSubmit}>
            <h3>{editUser ? 'Editar usuario' : 'Agregar usuario'}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>            <div className="form-group">
              <label>Usuario</label>
              <input 
                name="usuario" 
                value={form.usuario} 
                onChange={handleChange} 
                required={form.rol !== 'padre'}
                disabled={form.rol === 'padre'}
                placeholder={form.rol === 'padre' ? 'Se generará automáticamente' : ''}
              />
              {form.rol === 'padre' && (
                <small style={{color: '#666', fontSize: '12px'}}>
                  El usuario se generará automáticamente como: matrícula + homoclave
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input name="correo" value={form.correo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} required disabled={!!editUser}>
                <option value="">Selecciona un rol</option>
                <option value="admin">Administrador</option>
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre/Tutor</option>
              </select>
            </div>            {!editUser && form.rol !== 'padre' && (
              <div className="form-group">
                <label>Contraseña</label>
                <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required />
              </div>
            )}
            {!editUser && form.rol === 'padre' && (
              <div className="form-group" style={{backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '6px', border: '1px solid #90caf9'}}>
                <h4 style={{margin: '0 0 10px 0', color: '#1976d2'}}>📧 Información importante</h4>
                <ul style={{margin: 0, paddingLeft: '20px', color: '#1976d2', fontSize: '14px'}}>
                  <li>Se generará una contraseña temporal automáticamente</li>
                  <li>Se enviará un correo a {form.correo || '[correo]'} con las credenciales</li>
                  <li>El padre tendrá 3 días para cambiar su contraseña</li>
                  <li>El usuario será: matrícula del estudiante + homoclave</li>
                </ul>
              </div>
            )}
            {renderExtraFields()}
            <button type="submit">{editUser ? 'Guardar cambios' : 'Crear usuario'}</button>
            <button type="button" onClick={closeModal}>Cancelar</button>
          </form>
        </div>
      )}
      {confirmDelete && (
        <div className="modal-bg">
          <div className="modal-form">
            <p>¿Seguro que deseas eliminar este usuario?</p>
            <button onClick={() => handleDelete(confirmDelete)}>Sí, eliminar</button>
            <button onClick={() => setConfirmDelete(null)}>Cancelar</button>          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}

export default UsuariosList;

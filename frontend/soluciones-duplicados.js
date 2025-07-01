// SOLUCIONES RECOMENDADAS PARA EL FRONTEND

// 1. VERIFICAR ANTES DE REGISTRAR
// Agregar un endpoint para verificar si un correo ya existe
async function verificarCorreoDisponible(correo) {
    try {
        const response = await fetch(`/api/usuarios/check-email/${encodeURIComponent(correo)}`);
        const data = await response.json();
        return data.disponible;
    } catch (error) {
        console.error('Error verificando correo:', error);
        return false;
    }
}

// 2. MANEJAR ERRORES 409 EN EL FRONTEND
async function registrarEstudiante(datosEstudiante) {
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEstudiante)
        });
        
        if (response.status === 409) {
            // Error específico para duplicados
            throw new Error('Este correo electrónico ya está registrado. Por favor usa un correo diferente.');
        }
        
        if (!response.ok) {
            throw new Error('Error al registrar estudiante');
        }
        
        return await response.json();
        
    } catch (error) {
        // Mostrar mensaje específico al usuario
        alert(error.message);
        throw error;
    }
}

// 3. SUGERIR CORREOS ALTERNATIVOS
function sugerirCorreosAlternativos(nombre, apellido) {
    const base = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`;
    return [
        `${base}@estudiantes.escuela.com`,
        `${base}${new Date().getFullYear()}@estudiantes.escuela.com`,
        `${base}${Math.floor(Math.random() * 1000)}@estudiantes.escuela.com`
    ];
}

// 4. VALIDACIÓN EN TIEMPO REAL
function validarCorreoEnTiempoReal(inputCorreo) {
    inputCorreo.addEventListener('blur', async (e) => {
        const correo = e.target.value;
        if (correo) {
            const disponible = await verificarCorreoDisponible(correo);
            if (!disponible) {
                mostrarError('Este correo ya está registrado');
                const sugerencias = sugerirCorreosAlternativos(nombre, apellido);
                mostrarSugerencias(sugerencias);
            }
        }
    });
}

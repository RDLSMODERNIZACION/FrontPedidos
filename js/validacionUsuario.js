let usuarioActual = null;

async function validarUsuario(email) {
  try {
    const usuariosSecretarias = await fetch('config/usuarios_secretarias.json').then(r => r.json());
    const usuariosProveedores = await fetch('config/usuarios_proveedores.json').then(r => r.json());
    const usuariosAdministradores = await fetch('config/usuarios_administradores.json').then(r => r.json());

    let usuario = usuariosSecretarias.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (usuario) return { ...usuario, tipo: "Secretaría" };

    usuario = usuariosProveedores.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (usuario) return { ...usuario, tipo: "Proveedor" };

    usuario = usuariosAdministradores.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (usuario) return { ...usuario, tipo: "Administrador" };

    return null;
  } catch (error) {
    console.error('Error validando usuario:', error);
    return null;
  }
}

async function validarUsuarioManual(usuario, password) {
  try {
    const usuarios = await fetch('config/usuarios_password.json').then(r => r.json());
    const userFound = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === password);

    if (!userFound) return null;

    return {
      email: userFound.usuario,
      nombre: userFound.nombre,
      secretaria: userFound.secretaria,
      tipo: userFound.tipo
    };

  } catch (error) {
    console.error('Error validando usuario manual:', error);
    return null;
  }
}

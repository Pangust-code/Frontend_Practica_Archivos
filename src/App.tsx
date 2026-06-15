import { useState, useEffect } from 'react';
import axios from 'axios';

// Tu IP pública de Google Cloud (Nginx)
const API_URL = 'http://34.45.5.88/api'; 

function App() {
  const [recursos, setRecursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [titulo, setTitulo] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  // --- PAGINACIÓN DE USUARIOS ---
  const [paginaActualUsuarios, setPaginaActualUsuarios] = useState(1);
  const usuariosPorPagina = 5;

  // --- PAGINACIÓN DE RECURSOS ---
  const [paginaActualRecursos, setPaginaActualRecursos] = useState(1);
  const recursosPorPagina = 5;

  // Cargar datos al iniciar
  useEffect(() => {
    fetchRecursos();
    fetchUsuarios();
  }, []);

  const fetchRecursos = async () => {
    try {
      const response = await axios.get(`${API_URL}/recursos`);
      setRecursos(response.data);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/usuarios`, { nombre, email, password });
      alert(`Usuario registrado con éxito. ID: ${res.data.usuario.id}`);
      setNombre(''); setEmail(''); setPassword('');
      fetchUsuarios(); 
    } catch (error) {
      alert('Error al registrar usuario');
    }
  };

  const handleSubida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return alert('Selecciona un archivo');
    
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('usuario_id', usuarioId);
    formData.append('archivo', archivo);

    try {
      await axios.post(`${API_URL}/recursos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Archivo subido correctamente');
      setTitulo(''); setUsuarioId(''); setArchivo(null);
      fetchRecursos(); 
    } catch (error) {
      alert('Error al subir el archivo');
    }
  };

  const handleEliminarRecurso = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) return;
    try {
      await axios.delete(`${API_URL}/recursos/${id}`);
      fetchRecursos(); 
      // Si la página se queda vacía tras eliminar, retrocedemos una
      if (recursosPaginados.length === 1 && paginaActualRecursos > 1) {
        setPaginaActualRecursos(paginaActualRecursos - 1);
      }
    } catch (error) {
      alert('Error al eliminar el recurso');
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/usuarios/${id}`);
      fetchUsuarios(); 
      if (usuariosPaginados.length === 1 && paginaActualUsuarios > 1) {
        setPaginaActualUsuarios(paginaActualUsuarios - 1);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error);
      } else {
        alert('Error al eliminar el usuario');
      }
    }
  };

  // --- MATEMÁTICA DE PAGINACIÓN: USUARIOS ---
  const indiceUltimoUsuario = paginaActualUsuarios * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosPaginados = usuarios.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginasUsuarios = Math.ceil(usuarios.length / usuariosPorPagina);

  const irPaginaSiguienteUsuarios = () => setPaginaActualUsuarios(prev => Math.min(prev + 1, totalPaginasUsuarios));
  const irPaginaAnteriorUsuarios = () => setPaginaActualUsuarios(prev => Math.max(prev - 1, 1));

  // --- MATEMÁTICA DE PAGINACIÓN: RECURSOS ---
  const indiceUltimoRecurso = paginaActualRecursos * recursosPorPagina;
  const indicePrimerRecurso = indiceUltimoRecurso - recursosPorPagina;
  const recursosPaginados = recursos.slice(indicePrimerRecurso, indiceUltimoRecurso);
  const totalPaginasRecursos = Math.ceil(recursos.length / recursosPorPagina);

  const irPaginaSiguienteRecursos = () => setPaginaActualRecursos(prev => Math.min(prev + 1, totalPaginasRecursos));
  const irPaginaAnteriorRecursos = () => setPaginaActualRecursos(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
          Portal Académico
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Arquitectura Distribuida en la Nube</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECCIÓN 1: REGISTRO */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">1. Registrar Usuario</h3>
          <form onSubmit={handleRegistro} className="flex flex-col gap-4">
            <input type="text" placeholder="Nombre completo" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
            <input type="email" placeholder="Correo electrónico" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
            <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
            <button type="submit" className="mt-2 w-full py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm">Registrar</button>
          </form>
        </div>

        {/* SECCIÓN 2: SUBIDA DE ARCHIVOS */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">2. Subir Recurso</h3>
          <form onSubmit={handleSubida} className="flex flex-col gap-4">
            <input type="text" placeholder="Título del archivo" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"/>
            <input type="number" placeholder="ID del Usuario (Ej: 1)" required min="1" value={usuarioId} onChange={e => setUsuarioId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"/>
            <input type="file" required onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all"/>
            <button type="submit" className="mt-2 w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm">Subir al Servidor</button>
          </form>
        </div>
      </div>

      {/* SECCIÓN 3: LISTADO DE RECURSOS PAGINADO */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">3. Recursos en la Nube</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">ID</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">Título</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">Fecha de Subida</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recursos.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">No hay archivos subidos.</td></tr>
                ) : (
                  recursosPaginados.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{rec.id}</td>
                      <td className="p-4 text-gray-700">{rec.titulo}</td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(rec.fecha_subida).toLocaleString()}</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button onClick={() => window.open(`${API_URL}/recursos/${rec.id}/descargar`, '_blank')} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-bold text-xs hover:bg-blue-200 transition-colors">Descargar</button>
                        <button onClick={() => handleEliminarRecurso(rec.id)} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* CONTROLES DE PAGINACIÓN: RECURSOS */}
          {recursos.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
              <button 
                onClick={irPaginaAnteriorRecursos} 
                disabled={paginaActualRecursos === 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Página {paginaActualRecursos} de {totalPaginasRecursos}
              </span>
              <button 
                onClick={irPaginaSiguienteRecursos} 
                disabled={paginaActualRecursos === totalPaginasRecursos}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 4: LISTADO DE USUARIOS PAGINADO */}
      <div className="mt-12 mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">4. Usuarios Registrados</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">ID</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">Nombre</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider">Email</th>
                  <th className="p-4 font-semibold uppercase text-sm tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">No hay usuarios registrados.</td></tr>
                ) : (
                  usuariosPaginados.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{user.id}</td>
                      <td className="p-4 text-gray-700">{user.nombre}</td>
                      <td className="p-4 text-gray-500 text-sm">{user.email}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleEliminarUsuario(user.id)} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* CONTROLES DE PAGINACIÓN: USUARIOS */}
          {usuarios.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
              <button 
                onClick={irPaginaAnteriorUsuarios} 
                disabled={paginaActualUsuarios === 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Página {paginaActualUsuarios} de {totalPaginasUsuarios}
              </span>
              <button 
                onClick={irPaginaSiguienteUsuarios} 
                disabled={paginaActualUsuarios === totalPaginasUsuarios}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
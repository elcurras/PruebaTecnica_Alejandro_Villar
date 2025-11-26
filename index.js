//IMPORTACIONES DE LIBRERIAS

const express = require('express');
const path = require('path'); // Módulo para trabajar con rutas de archivos
const { Sequelize } = require('sequelize');
const config = require('./configVars'); // Importamos la configuración de la base de datos
const ClaimModel = require('./models/claim.model'); // Importamos nuestro modelo

//CONFIGURACIÓN DE LA APLICACIÓN

const app = express();
const PORT = process.env.PORT || 3000;

//Middlewares para parsear el cuerpo de las peticiones en formato JSON y URL-encoded
//Esto es necesario para recibir los datos del formulario.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

//CONEXIÓN DE LA BASE DE DATOS
const sequelize = new Sequelize(
    config.db.name,
    config.db.username,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect
    }
);
//Inicializamos el modelo 'Claim' pasándole la instancia de sequelize
const Claim = ClaimModel(sequelize);

// RUTA PRINCIPAL 
// Hacemos que la página principal sea el listado de reclamaciones
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

//DEFINICIÓN DE RUTAS DE LA API 

//Ruta para crear una nueva reclamación (POST /api/claims)
//Esta ruta recibe los datos enviados desde formulario.html
app.post('/api/claims', async (req, res) => {
    try {
        //Creamos una nueva reclamación en la base de datos con los datos del cuerpo de la petición
        const newClaim = await Claim.create(req.body);
        //Respondemos con un estado 201 (Creado) y los datos de la nueva reclamación.
        //El frontend se encargará de redirigir al usuario.
        res.status(201).json(newClaim);
    } catch (error) {
        //Si hay un error (por ejemplo, de validación de datos), lo devolvemos
        console.error('Error al crear la reclamación:', error);
        res.status(400).json({ message: 'Error en los datos enviados', error: error.message });
    }
});

// Ruta para obtener todas las reclamaciones (GET /api/claims)
// Esta ruta proporcionará los datos para la tabla en index.html
app.get('/api/claims', async (req, res) => {
    try {
        // Usamos el modelo para buscar todas las reclamaciones, ordenadas por la más reciente
        const claims = await Claim.findAll({ order: [['createdAt', 'DESC']] });
        // Enviamos las reclamaciones como respuesta en formato JSON
        res.status(200).json(claims);
    } catch (error) {
        // Si hay un error, lo mostramos en la consola y enviamos una respuesta de error
        console.error('Error al obtener las reclamaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para marcar una reclamación como completada (PUT /api/claims/:id/complete)
app.put('/api/claims/:id/complete', async (req, res) => {
    try {
        const claim = await Claim.findByPk(req.params.id);
        if (claim) {
            claim.active = false; // Marcamos como inactiva (completada)
            await claim.save();
            res.status(200).json(claim);
        } else {
            res.status(404).json({ message: 'Reclamación no encontrada' });
        }
    } catch (error) {
        console.error('Error al completar la reclamación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para eliminar una reclamación (DELETE /api/claims/:id)
app.delete('/api/claims/:id', async (req, res) => {
    try {
        const claim = await Claim.findByPk(req.params.id);
        if (claim) {
            if (!claim.active) {
                // No permitimos borrar reclamaciones ya completadas
                return res.status(400).json({ message: 'No se puede eliminar una reclamación completada.' });
            }
            await claim.destroy();
            res.status(204).send(); // 204 No Content: éxito, sin nada que devolver
        } else {
            res.status(404).json({ message: 'Reclamación no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la reclamación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//INICIALIZACIÓN DEL SERVIDOR 

const startServer = async () => {
    try {
        //Autenticamos la conexión con la base de datos
        await sequelize.authenticate();
        console.log('Conexión con la base de datos establecida correctamente.');
        
        //Sincronizamos los modelos con la base de datos.
        //Esto creará la tabla 'claims' si no existe.
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados con la base de datos.');

        //Arrancamos el servidor Express para que escuche peticiones
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
            console.log(`Aplicación disponible en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

//Llamamos a la función para iniciar todo el proceso
startServer();
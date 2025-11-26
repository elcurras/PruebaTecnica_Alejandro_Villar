//modelo de Claim(Reclamación) para la base de datos
//importamos los tipos de datos de sequelize
const { DataTypes } = require('sequelize');
// Exportamos una función que define el modelo 'Claim'
// Esta función recibirá la instancia de Sequelize como argumento
module.exports = (sequelize) => {

    // Definimos el modelo 'Claim' con sus atributos
    const claim =sequelize.define('Claim', {
    //El ID se crea automaticamente por Sequelize.
        //definimos los campos del modelo.
            //email de tipo String y es opcional por lo que permitiremos campos nulos.
        email: {
            type: DataTypes.STRING,
            allowNull: true, //no es obligatorio
            validate: {
                isEmail: true, // Valida que el formato sea de email
            }
        },

            //relationship de tipo ENUM para restringir los valores a 'Internal' o 'External' y es obligatorio.
        relationship: {
            type: DataTypes.ENUM('Internal', 'External'),
            allowNull: false, // es obligatorio
        },

            //Behaviour Type de tipo ENUM para restringir los valores a 'Procurement', 'Transport safety', 'Financial' y es obligatorio.
        behaviourType: {
            type: DataTypes.ENUM('Procurement', 'Transport safety', 'Financial'),
            allowNull: false, // es obligatorio 
        },

            //details de tipo TEXT para permitir descripciones largas y es obligatorio.
        details: {
            type: DataTypes.TEXT,
            allowNull: false, // es obligatorio
        },

        //breachDate de tipo DATE para almacenar la fecha de la supuesta reclamación y es obligatorio.
        breachDate: {
            type: DataTypes.DATE,
            allowNull: false, // es obligatorio
        },

        //active de tipo BOOLEAN para indicar si la reclamación está activa o completada. Por defecto es true (activa).
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true, // por defecto es activa
        },
    },
    {
        tableName : 'claims', // Nombre de la tabla en la base de datos
        timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
    }); 
    return claim;
};




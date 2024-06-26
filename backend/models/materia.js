// models/materia.js
module.exports = (sequelize, DataTypes) => {
    const Materia = sequelize.define('Materia', {
        id_materia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigomateria: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'materia',
        timestamps: false
    });

    return Materia;
};

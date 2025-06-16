import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es requerido' },
        len: { args: [2, 50], msg: 'El nombre debe tener entre 2-50 caracteres' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El apellido es requerido' },
        len: { args: [2, 50], msg: 'El apellido debe tener entre 2-50 caracteres' }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: { msg: 'El email ya está registrado' },
      allowNull: false,
      validate: {
        isEmail: { msg: 'Debe ser un email válido' },
        notEmpty: { msg: 'El email es requerido' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6, 100], msg: 'La contraseña debe tener 6+ caracteres' }
      }
    },
    profileImage: {
      type: DataTypes.STRING,
      defaultValue: 'default-profile.jpg',
      validate: {
        isUrl: { msg: 'La imagen debe ser una URL válida' }
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      afterCreate: (user) => {
        // Ejemplo: Lógica post-creación (puedes enviar email de bienvenida)
        console.log(`Usuario creado: ${user.email}`);
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    },
    scopes: {
      withSensitiveData: {
        attributes: { include: ['password', 'resetPasswordToken'] }
      }
    }
  });

  // Método para comparar contraseñas
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Método para generar token de reset
  User.prototype.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutos
    return resetToken;
  };

  // Relaciones
  User.associate = (models) => {
    // Amistades (many-to-many)
    User.belongsToMany(models.User, {
      as: 'friends',
      through: 'UserFriends',
      foreignKey: 'userId',
      otherKey: 'friendId'
    });

    // Solicitudes de amistad
    User.hasMany(models.FriendRequest, {
      as: 'sentFriendRequests',
      foreignKey: 'senderId'
    });
    User.hasMany(models.FriendRequest, {
      as: 'receivedFriendRequests',
      foreignKey: 'receiverId'
    });

    // Álbumes creados
    User.hasMany(models.Album, {
      foreignKey: 'userId'
    });

    // Comentarios
    User.hasMany(models.Comment, {
      foreignKey: 'userId'
    });
  };

  return User;
};
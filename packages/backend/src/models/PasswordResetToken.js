const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo PasswordResetToken
 * Almacena tokens temporales para recuperación de contraseñas
 */
const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [32, 255]
    }
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hash del token para seguridad adicional'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date().toISOString()
    }
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['token'],
      unique: true
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['isUsed']
    },
    {
      // Índice compuesto para búsquedas eficientes
      fields: ['token', 'isUsed', 'expiresAt']
    }
  ],
  scopes: {
    valid: {
      where: {
        isUsed: false,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    },
    expired: {
      where: {
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    },
    used: {
      where: {
        isUsed: true
      }
    }
  },
  hooks: {
    beforeCreate: (token) => {
      // Asegurar que el token expire en 1 hora si no se especifica
      if (!token.expiresAt) {
        token.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      }
    },
    beforeUpdate: (token) => {
      // Si se marca como usado, registrar el momento
      if (token.isUsed && !token.usedAt) {
        token.usedAt = new Date();
      }
    }
  }
});

/**
 * Método estático para limpiar tokens expirados
 */
PasswordResetToken.cleanupExpiredTokens = async function() {
  try {
    const deletedCount = await this.destroy({
      where: {
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Limpieza: ${deletedCount} tokens expirados eliminados`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('❌ Error limpiando tokens expirados:', error);
    return 0;
  }
};

/**
 * Método estático para invalidar todos los tokens de un usuario
 */
PasswordResetToken.invalidateUserTokens = async function(userId) {
  try {
    const updatedCount = await this.update(
      { 
        isUsed: true,
        usedAt: new Date()
      },
      {
        where: {
          userId,
          isUsed: false
        }
      }
    );
    
    console.log(`🔒 ${updatedCount[0]} tokens invalidados para usuario ${userId}`);
    return updatedCount[0];
  } catch (error) {
    console.error('❌ Error invalidando tokens del usuario:', error);
    return 0;
  }
};

/**
 * Método de instancia para verificar si el token es válido
 */
PasswordResetToken.prototype.isValid = function() {
  const now = new Date();
  return !this.isUsed && this.expiresAt > now;
};

/**
 * Método de instancia para marcar el token como usado
 */
PasswordResetToken.prototype.markAsUsed = async function() {
  this.isUsed = true;
  this.usedAt = new Date();
  return await this.save();
};

module.exports = PasswordResetToken;
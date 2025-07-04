const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: { // changed from 'name' to 'username'
    type: DataTypes.STRING,
    allowNull: true // add this if NOT NULL in DB
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});



// Tasks
const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  // IMPORTANT: Frontend must send priority as 'LOW', 'MEDIUM', or 'HIGH' (uppercase)
  priority: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
  processing_type: { type: DataTypes.ENUM('IMAGES'), allowNull: false, defaultValue: 'IMAGES' },
  status: { type: DataTypes.ENUM('PENDING', 'PROCESSING', 'DONE', 'ERROR'), defaultValue: 'PENDING' },
  images_total: { type: DataTypes.INTEGER, defaultValue: 0 },
  images_processed: { type: DataTypes.INTEGER, defaultValue: 0 },
  email_status: { type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

// Documents linked to tasks (images)
const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER, references: { model: Task, key: 'id' } },
  original_url: { type: DataTypes.STRING, allowNull: false },
  thumb_url: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('PENDING', 'PROCESSED', 'FAILED'), defaultValue: 'PENDING' },
  base64_data: { type: DataTypes.TEXT('long'), allowNull: true }
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true
});

// Email jobs
const EmailJob = sequelize.define('EmailJob', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER, references: { model: Task, key: 'id' } },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_error: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' }
}, {
  tableName: 'email_jobs',
  timestamps: true,
  underscored: true
});

// Associations
User.hasMany(Task, { foreignKey: 'user_id' });
Task.belongsTo(User, { foreignKey: 'user_id' });
Task.hasMany(Document, { foreignKey: 'task_id' });
Document.belongsTo(Task, { foreignKey: 'task_id' });
Task.hasMany(EmailJob, { foreignKey: 'task_id' });
EmailJob.belongsTo(Task, { foreignKey: 'task_id' });

module.exports = { sequelize, User, Task, Document, EmailJob }; 
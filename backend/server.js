require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes.auth');
const taskRoutes = require('./routes.tasks');
const userRoutes = require('./routes.users');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Placeholder for auth routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/api/users', userRoutes);

sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;
  const httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  require('./socket').init(httpServer);
  });
});

const express = require('express');
const upload = require('./middleware/upload');
const { Task, Document } = require('./models');
const { imageQueue, emailQueue } = require('./queues/bull');
const { addImageProcessingJob } = require('./queues/image.worker');

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({ include: ['Documents', 'EmailJobs'] });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

// Get task details with documents & email attempts
router.get('/:id', async (req, res) => {
  const task = await Task.findByPk(req.params.id, { include: ['Documents', 'EmailJobs'] });
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json(task);
});

// Create Task with images (accepts base64 images array)
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, processing_type, images = [] } = req.body;
    const userId = req.user?.id || null; // assume auth middleware populates
    const images_total = Array.isArray(images) ? images.length : 0;

    const task = await Task.create({
      title,
      description,
      priority,
      processing_type,
      user_id: userId,
      images_total,
      images_processed: 0,
      status: images_total > 0 ? 'PROCESSING' : 'DONE',
      email_status: 'PENDING'
    });

    console.log(task);

    // Store docs as pending
    for (const base64 of images) {
      await Document.create({
        task_id: task.id,
        status: 'PENDING',
        base64_data: base64,
        original_url: 'base64'
      });
    }

    console.log("created task", task);

    // notify via socket (send full task with documents)
    const io = require('./socket').getIO();
    const fullTask = await Task.findByPk(task.id, { include: ['Documents', 'EmailJobs'] });
    io.emit('task-created', fullTask);

    console.log(fullTask);

    res.status(201).json({ task: fullTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Task creation failed', error: err.message });
  }
});


  // Update Task (accepts base64 images array)
  router.put('/:id', async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) return res.status(404).json({ message: 'Not found' });

    const { title, description, priority, processing_type, status, images = [] } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (processing_type) task.processing_type = processing_type;
    if (status) task.status = status;

    // Handle new images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (const base64 of images) {
        const doc = await Document.create({ task_id: task.id, status: 'PENDING', base64_data: base64, original_url: 'base64' });
        await imageQueue.add({ taskId: task.id, documentId: doc.id });
      }
      // Update images_total and status if new images were added
      const docsCount = await Document.count({ where: { task_id: task.id } });
      task.images_total = docsCount;
      task.status = 'PROCESSING';
    }

    await task.save();

    // Fetch full task with associations
    const fullTask = await Task.findByPk(task.id, { include: ['Documents', 'EmailJobs'] });

    // Emit socket event for real-time update
    const io = require('./socket').getIO();
    io.emit('task-updated', fullTask);

    res.json({ task: fullTask });
  } catch (err) {
    res.status(500).json({ message: 'Task update failed', error: err.message });
  }
});

// Delete Task and its documents
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: ['Documents'] });
    if (!task) return res.status(404).json({ message: 'Not found' });
    // Delete associated documents
    for (const doc of task.Documents || []) {
      await doc.destroy();
    }
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Task deletion failed', error: err.message });
  }
});



// router.post('/', async (req, res) => {
//   try {
//     const { title, description, priority, processing_type, images = [] } = req.body;
//     const userId = req.user?.id || null; // assume auth middleware populates
//     const images_total = Array.isArray(images) ? images.length : 0;
//     const task = await Task.create({ title, description, priority, processing_type, user_id: userId, images_total, images_processed: 0, status: images_total > 0 ? 'PROCESSING' : 'DONE', email_status: 'PENDING' });
//     console.log(task);
//     // Store docs as pending & queue jobs
//     for (const base64 of images) {
//       const doc = await Document.create({ task_id: task.id, status: 'PENDING', base64_data: base64, original_url: 'base64' });
//       await imageQueue.add({ taskId: task.id, documentId: doc.id });
//     }

//     console.log("created task", task);

//     // enqueue email
//     await emailQueue.add({ taskId: task.id });

//     // notify via socket (send full task with documents)
//     const io = require('./socket').getIO();
//     const fullTask = await Task.findByPk(task.id, { include: ['Documents', 'EmailJobs'] });
//     io.emit('task-created', fullTask);

//     console.log(fullTask);

//     res.status(201).json({ task: fullTask });
//   } catch (err) {
//     console.error(err);
//     console.log(err);
//     res.status(500).json({ message: 'Task creation failed', error: err.message });
//   }
// });


// const express = require('express');
// const router = express.Router();
// const { Document, Task, sequelize } = require('./models');
// const { addImageProcessingJob } = require('./queues/image.worker');
// const upload = require('./middleware/upload');

// // Upload route with transaction support
// router.post('/', upload.array('images'), async (req, res) => {
//   try {
//     console.log('Request body:', req.body);
//     console.log('Uploaded files:', req.files);

//     const files = req.body.images;
//     let taskId = req.body.taskId;

//     // Validate files
//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     // Use transaction for atomicity
//     const result = await sequelize.transaction(async (t) => {
//       let task;

//       // If taskId provided, try to find existing task
//       if (taskId) {
//         // Validate taskId
//         if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
//           throw new Error('Invalid task ID format. Must be a positive integer.');
//         }

//         task = await Task.findByPk(Number(taskId), { transaction: t });
//         if (!task) {
//           throw new Error('Task not found');
//         }

//         // Update existing task
//         task.images_total = files.length;
//         task.status = 'PROCESSING';
//         await task.save({ transaction: t });
//         console.log('Updated existing task:', task.id);
//       } else {
//         // Create new task
//         task = await Task.create(
//           {
//             title: req.body.title || 'Untitled Task',
//             description: req.body.description || '',
//             priority: req.body.priority || 'MEDIUM',
//             status: 'PROCESSING',
//             images_total: files.length,
//             images_processed: 0,
//             due_date: req.body.due_date || null,
//             assigned_to: req.body.assigned_to || null,
//           },
//           { transaction: t }
//         );
//         console.log('Created new task:', task.id);
//         taskId = task.id;
//       }

//       // Create document records and add jobs to queue
//       const documents = [];
//       for (const file of files) {
//         const doc = await Document.create(
//           {
//             task_id: taskId,
//             original_url: `/uploads/${file.filename}`,
//             status: 'PENDING',
//             file_size: file.size,
//             mime_type: file.mimetype,
//           },
//           { transaction: t }
//         );

//         documents.push(doc);

//         // Add job to queue
//         try {
//           await addImageProcessingJob(taskId, file.filename);
//           console.log(`Job added for file: ${file.filename}`);
//         } catch (queueError) {
//           console.error(`Failed to add job for file ${file.filename}:`, queueError);
//           doc.status = 'FAILED';
//           doc.error_message = queueError.message;
//           await doc.save({ transaction: t });
//         }
//       }

//       return { task, documents };
//     });

//     // Return the complete task data
//     res.json({
//       success: true,
//       task: {
//         id: result.task.id,
//         title: result.task.title,
//         description: result.task.description,
//         priority: result.task.priority,
//         status: result.task.status,
//         images_total: result.task.images_total,
//         images_processed: result.task.images_processed,
//         due_date: result.task.due_date,
//         assigned_to: result.task.assigned_to,
//         created_at: result.task.createdAt,
//         updated_at: result.task.updatedAt,
//       },
//       documents: result.documents,
//       message: 'Task created and files uploaded successfully',
//     });
//   } catch (error) {
//     console.error('Upload failed:', error);
//     res.status(error.message.includes('Task not found') ? 404 : 500).json({ error: error.message });
//   }
// });

// // Task creation route
// router.post('/tasks', async (req, res) => {
//   try {
//     const taskData = req.body;

//     const task = await Task.create({
//       title: taskData.title || 'Untitled Task',
//       description: taskData.description || '',
//       priority: taskData.priority || 'MEDIUM',
//       status: 'PENDING',
//       images_total: 0,
//       images_processed: 0,
//       due_date: taskData.due_date || null,
//       assigned_to: taskData.assigned_to || null,
//     });

//     res.json({
//       success: true,
//       task,
//     });
//   } catch (error) {
//     console.error('Task creation failed:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
// Listen to document status updates and emit to clients
const { imageQueue } = require('../queues/bull');
const { Document, Task } = require('../models');
const { getIO } = require('../socket');

imageQueue.on('completed', async (job, result) => {
  try {
    const doc = await Document.findByPk(job.data.documentId);
    if (doc) {
      const io = getIO();
      io.emit('document-updated', doc);
      // Optionally, emit the updated task as well
      const task = await Task.findByPk(doc.task_id, { include: ['Documents', 'EmailJobs'] });
      io.emit('task-updated', task);
    }
  } catch (err) {
    console.error('Socket emit failed:', err);
  }
});

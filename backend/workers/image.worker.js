require('dotenv').config();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { imageQueue } = require('../queues/bull');
const { Task, Document } = require('../models');

imageQueue.process(async job => {
  const { taskId, filename } = job.data;
  const srcPath = path.join(__dirname, '..', 'uploads', filename);
  const thumbName = `thumb-${filename}`;
  const thumbPath = path.join(__dirname, '..', 'uploads', thumbName);

  await sharp(srcPath).resize(256).toFile(thumbPath);

  const doc = await Document.create({
    task_id: taskId,
    original_url: `/uploads/${filename}`,
    thumb_url: `/uploads/${thumbName}`,
    status: 'PROCESSED'
  });

  // Increment images_processed on Task
  const { Task } = require('../models');
  const task = await Task.findByPk(taskId);
  if (task) {
    task.images_processed += 1;
    // If all images processed and email_status is SENT, mark as DONE
    if (task.images_processed >= task.images_total && task.email_status === 'SENT') {
      task.status = 'DONE';
    } else if (task.images_processed >= task.images_total) {
      task.status = 'PROCESSING'; // waiting for email
    }
    await task.save();
  }

  // notify via socket
  const io = require('../socket').getIO();
  io.to(`task-${taskId}`).emit('thumbnail-ready', doc);

  return doc;
});

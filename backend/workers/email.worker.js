require('dotenv').config();
const nodemailer = require('nodemailer');
const { emailQueue } = require('../queues/bull');
const { Task, EmailJob } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

emailQueue.process(async job => {
  const { taskId } = job.data;
  let emailJob = await EmailJob.create({ task_id: taskId });
  const { Task } = require('../models');
  try {
    const task = await Task.findByPk(taskId);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.NOTIFY_TO,
      subject: `Task #${task.id} created`,
      text: `Task ${task.title} is now in status ${task.status}`,
      html: `<p>Task <b>${task.title}</b> is now in status <b>${task.status}</b></p>`
    });
    await emailJob.update({ status: 'SENT' });
    if (task) {
      task.email_status = 'SENT';
      // If all images processed, mark as DONE
      if (task.images_processed >= task.images_total) {
        task.status = 'DONE';
      }
      await task.save();
    }
  } catch (err) {
    const attempts = emailJob.attempts + 1;
    await emailJob.update({ attempts, last_error: err.message, status: attempts >= 3 ? 'FAILED' : 'PENDING' });
    if (attempts < 3) throw err; // re-queue with backoff
    // Mark task as error if failed
    const task = await Task.findByPk(taskId);
    if (task) {
      task.email_status = 'FAILED';
      if (attempts >= 3) {
        task.status = 'ERROR';
      }
      await task.save();
    }
  }
});

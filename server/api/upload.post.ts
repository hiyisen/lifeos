import { savePhoto } from '../utils/photo';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No files uploaded' });
  }

  const modulePart = formData.find((f) => f.name === 'module');
  const module = modulePart?.data.toString('utf-8') || 'general';
  const fileParts = formData.filter((f) => f.name === 'files');

  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, message: 'No files uploaded' });
  }

  const paths = fileParts.map((f) =>
    savePhoto({ data: f.data, filename: f.filename || 'photo.jpg' }, module),
  );

  return { success: true, data: paths };
});

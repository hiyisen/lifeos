import { savePhoto } from '../utils/photo';

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, message: 'No files uploaded' });
  }

  const paths = files.map((f) =>
    savePhoto({ data: f.data, filename: f.filename || 'photo.jpg' }, f.name || 'general'),
  );

  return { success: true, data: paths };
});

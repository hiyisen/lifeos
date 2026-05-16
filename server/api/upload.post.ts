/**
 * 文件上传API接口
 * 处理照片文件的上传，支持按模块分类存储
 */

import { savePhoto } from '../utils/photo';

export default defineEventHandler(async (event) => {
  // 读取multipart/form-data格式的请求体
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No files uploaded' });
  }

  // 获取上传模块参数（用于确定存储目录）
  const modulePart = formData.find((f) => f.name === 'module');
  const module = modulePart?.data.toString('utf-8') || 'general';
  // 获取所有文件部分
  const fileParts = formData.filter((f) => f.name === 'files');

  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, message: 'No files uploaded' });
  }

  // 保存所有上传的文件并获取访问路径
  const paths = fileParts.map((f) =>
    savePhoto({ data: f.data, filename: f.filename || 'photo.jpg' }, module),
  );

  // 返回上传成功的文件路径数组
  return { success: true, data: paths };
});

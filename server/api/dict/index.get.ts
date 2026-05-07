import { getAllDicts } from '../../utils/dict';

export default defineEventHandler(() => {
  const data = getAllDicts();
  return { success: true, data };
});

import axiosClient from './axiosClient.js';

const ADMIN_LIST_PARAMS = {
  page: 1,
  limit: 5000,
  listAll: true,
  search: '',
  difficulty: 'all',
  tag: 'all',
  status: 'all',
  premiumOnly: false,
};

export async function fetchAdminProblemList() {
  const { data } = await axiosClient.get('/problem/getAllProblem', {
    params: ADMIN_LIST_PARAMS,
  });
  return data.problems ?? [];
}

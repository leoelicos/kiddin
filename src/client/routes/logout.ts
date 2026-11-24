import { redirect } from 'react-router';
import { api } from '../lib/api.ts';

export async function logoutAction() {
  await api.logout().catch(() => undefined);
  return redirect('/');
}

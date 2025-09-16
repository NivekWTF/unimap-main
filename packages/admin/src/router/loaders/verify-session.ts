import { redirect } from 'react-router-dom';

export default function verifySession() {
  const token = sessionStorage.getItem('token');
  if (token) return redirect('/');
  return null;
}

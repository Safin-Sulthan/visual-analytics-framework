import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  validateEmail, validatePassword, validatePasswordConfirm, validateName,
} from '../../utils/validators';
import Button from '../common/Button';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    const nameErr   = validateName(form.name);
    const emailErr  = validateEmail(form.email);
    const passErr   = validatePassword(form.password);
    const confErr   = validatePasswordConfirm(form.password, form.confirmPassword);
    if (nameErr)  errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (passErr)  errs.password = passErr;
    if (confErr)  errs.confirmPassword = confErr;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    }
  };

  const fields = [
    { name: 'name',            label: 'Full Name',       type: 'text',     placeholder: 'Jane Doe' },
    { name: 'email',           label: 'Email',           type: 'email',    placeholder: 'you@example.com' },
    { name: 'password',        label: 'Password',        type: 'password', placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Confirm Password',type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Layers size={36} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Visual Analytics Framework</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder={placeholder}
                />
                {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}
            <Button type="submit" loading={loading} className="w-full justify-center">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

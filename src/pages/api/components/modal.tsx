import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SlackUser } from 'types';

interface ModalProps {
  user: SlackUser | null;
  onClose: () => void;
  organizationName: string;
  rotationName: string;
}

const Modal: React.FC<ModalProps> = ({
  user,
  onClose,
  organizationName,
  rotationName,
}) => {
  const [formData, setFormData] = useState<SlackUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  // CHANGED FIELDS

  const [changedFields, setChangedFields] = useState<Partial<SlackUser>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prevData) => ({
      ...(prevData as SlackUser),
      [name]: newValue,
    }));

    setChangedFields((prevChanges) => ({
      ...prevChanges,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    const BASE_API_URL = window.location.origin + '/api/v1' || 'http://localhost:3000/api/v1';

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_API_URL}/${organizationName}/${rotationName}/users`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updateData: changedFields,
            userId: formData.slack_id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating user data:', result.message);
        throw new Error('Network response was not ok');
      }

      console.log('User updated successfully:', result.user);
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      window.location.reload();
      setIsSubmitting(false);
      onClose();
    }
  };

  // TOGGLES
  const renderToggle = (id: string, name: keyof SlackUser, label: string) => {
    const isChecked = !!formData?.[name];

    return (
      <div className="flex items-center space-x-4">
        <label htmlFor={id} className="inline-flex items-center cursor-pointer">
          <span className="mr-3 text">{label}</span>
          <div className="relative">
            <input
              type="checkbox"
              id={id}
              name={name}
              checked={isChecked}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-red-500 rounded-full peer-checked:bg-secondary"/>
            <div className="absolute top-0.5 left-0.5 bg-light-bg w-5 h-5 rounded-full transition-transform transform peer-checked:translate-x-full"/>
          </div>
        </label>
      </div>
    );
  };

  // MODAL HERO

  return (
    <div className='fixed inset-x-0 top-0 h-full flex items-start justify-center'>
      <div className='absolute inset-0 z-10 bg-gray-800 bg-opacity-50' onClick={onClose}/>
      <div className='relative z-30 bg-light-bg p-6 sm:p-8 rounded-lg shadow-lg max-w-sm w-full mt-12 md:max-w-lg md:my-auto'>
        {/* CLOSE BUTTON */}
        <button
          className='absolute top-6 md:top-8 right-8 text text-2xl'
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className='text text-2xl font-semibold mb-6'>Update User</h2>
        <form onSubmit={handleSubmit}>

          {/* NAME & COUNT IN THE SAME ROW */}
          <div className='flex space-x-4 mb-4'>
            <div className='w-7/12'>
              <label
                className='block text text-sm font-bold mb-2'
                htmlFor='full_name'
              >
                Full Name
              </label>
              <input
                type='text'
                id='full_name'
                name='full_name'
                value={formData?.full_name || ''}
                onChange={handleChange}
                className='w-full px-3 py-2 border text rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black'
              />
            </div>
            <div className='w-5/12'>
              <label
                className='block text text-sm font-bold mb-2'
                htmlFor='count'
              >
                Count
              </label>
              <input
                type='number'
                id='count'
                name='count'
                value={formData?.count || ''}
                onChange={handleChange}
                className='w-full px-3 py-2 border text rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black'
              />
            </div>
          </div>

          {/* TOGGLES */}
          <div className="flex space-x-4 mb-4">
            {renderToggle('on_holiday', 'on_holiday', 'On Holiday')}
            {renderToggle('on_duty', 'on_duty', 'On Duty')}
            {renderToggle('on_backup', 'on_backup', 'On Backup')}
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-black font-semibold px-4 py-2 rounded-md shadow hover:bg-tertiary hover:text focus:outline-none focus:ring-2 focus:ring-tertiary'
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;

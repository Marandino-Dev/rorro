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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...(prevData as SlackUser),
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/${organizationName}/${rotationName}/users`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updateData: formData,
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
      setIsSubmitting(false);
      onClose();
    }
  };

  // MODAL HERO

  return (
    <div className='fixed inset-x-0 top-0 flex items-start justify-center z-50 bg-gray-800 bg-opacity-50'>
      <div className='relative bg-light-bg p-6 sm:p-8 rounded-lg shadow-lg max-w-sm w-full sm:max-w-sm sm:w-auto mt-8'>
        {/* CLOSE BUTTON */}
        <button
          className='top-4 right-4 text text-2xl hover:text-3xl'
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className='text text-2xl font-semibold mb-6'>Update User</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
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
          <div className='mb-4'>
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
          <div className='mb-4 flex items-center'>
            <input
              type='checkbox'
              id='on_holiday'
              name='on_holiday'
              checked={formData?.on_holiday || false}
              onChange={handleChange}
              className='mr-2'
            />
            <label htmlFor='on_holiday' className='text'>
              On Holiday
            </label>
          </div>
          <div className='mb-4 flex items-center'>
            <input
              type='checkbox'
              id='on_duty'
              name='on_duty'
              checked={formData?.on_duty || false}
              onChange={handleChange}
              className='mr-2'
            />
            <label htmlFor='on_duty' className='text'>
              On Duty
            </label>
          </div>
          <div className='mb-4 flex items-center'>
            <input
              type='checkbox'
              id='on_backup'
              name='on_backup'
              checked={formData?.on_backup || false}
              onChange={handleChange}
              className='mr-2'
            />
            <label htmlFor='on_backup' className='text'>
              On Backup
            </label>
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

import React from 'react';

const PatientRegister = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Patient Registration</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
                placeholder="First name"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
                placeholder="Last name"
              />
            </div>
            
            <div>
              <label htmlFor="dob" className="block text-sm font-medium mb-1">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">
                Gender
              </label>
              <select
                id="gender"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
                placeholder="Email address"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-2 focus:ring-primary/30"
              placeholder="Full address"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegister;

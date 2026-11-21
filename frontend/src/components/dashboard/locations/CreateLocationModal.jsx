
import React from 'react';
import { X } from 'lucide-react';

const CreateLocationModal = ({
  isOpen,
  onClose,
  newLocationForm,
  setNewLocationForm,
  handleCreateLocation,
}) => {
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setNewLocationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            Add New Service Location
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Location Form */}
        <form
          onSubmit={handleCreateLocation}
          className="space-y-4 mt-4 text-xs font-semibold"
        >

          {/* Site Name */}
          <div>
            <label className="text-slate-600 block mb-1">
              Site / Shelter Name *
            </label>

            <input
              type="text"
              required
              placeholder="e.g. Metro Disaster Relief Hub"
              value={newLocationForm.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-slate-600 block mb-1">
              Address
            </label>

            <input
              type="text"
              placeholder="Street address"
              value={newLocationForm.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* City */}
          <div>
            <label className="text-slate-600 block mb-1">
              City / Deployment Region *
            </label>

            <input
              type="text"
              required
              placeholder="e.g. Mumbai, Delhi, Metro Area"
              value={newLocationForm.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Date and Shift Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1">
                Deployment Date *
              </label>

              <input
                type="date"
                required
                value={newLocationForm.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">
                Shift Start *
              </label>

              <input
                type="time"
                required
                value={newLocationForm.shiftStart || '09:00'}
                onChange={(e) => handleChange('shiftStart', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">
                Shift End *
              </label>

              <input
                type="time"
                required
                value={newLocationForm.shiftEnd || '17:00'}
                onChange={(e) => handleChange('shiftEnd', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Required Skill */}
          <div>
            <label className="text-slate-600 block mb-1">
              Required Primary Skill *
            </label>

            <input
              type="text"
              required
              placeholder="e.g. Medical Advanced, Logistics"
              value={newLocationForm.requiredSkills}
              onChange={(e) => handleChange('requiredSkills', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Volunteers and Priority */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-slate-600 block mb-1">
                Needed Volunteers
              </label>

              <input
                type="number"
                min="1"
                value={newLocationForm.requiredVolunteers}
                onChange={(e) =>
                  handleChange('requiredVolunteers', Number(e.target.value))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">
                Priority Tier
              </label>

              <select
                value={newLocationForm.tier}
                onChange={(e) => handleChange('tier', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Tier 1">Tier 1 (Normal)</option>
                <option value="Tier 2">Tier 2 (Elevated)</option>
                <option value="Tier 3">Tier 3 (Critical)</option>
              </select>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Register Location
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateLocationModal;

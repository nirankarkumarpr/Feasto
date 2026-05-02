import { FaUserShield, FaCheck, FaTimes, FaCheckCircle, FaTrash } from "react-icons/fa";
import { MdPhone } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import { useState } from "react";

function PendingAdminsTab({ admins, onApprove, onReject }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (admin) => {
    setDeleteConfirm(admin);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onReject(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Sort: pending first, then approved
  const sortedAdmins = [...admins].sort((a, b) => {
    if (a.isApproved === b.isApproved) return 0;
    return a.isApproved ? 1 : -1;
  });

  if (admins.length === 0) {
    return (
      <div className="text-center py-16">
        <FaUserShield className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No admin accounts found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
        {sortedAdmins.map((admin) => (
          <article
            key={admin._id}
            className="group overflow-hidden rounded-2xl sm:rounded-4xl border border-slate-200 bg-white p-2.5 sm:p-5 shadow-[0_0_100px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]"
          >
            {/* Card Header - Reduced height */}
            <div className={`relative h-24 sm:h-40 overflow-hidden rounded-xl sm:rounded-2xl flex items-center justify-center ${
              admin.isApproved 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600'
            }`}>
              <div className="bg-white/20 p-3 sm:p-5 rounded-full">
                {admin.isApproved ? (
                  <FaCheckCircle className="text-2xl sm:text-4xl text-white" />
                ) : (
                  <FaUserShield className="text-2xl sm:text-4xl text-white" />
                )}
              </div>
              {!admin.isApproved && (
                <span className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full bg-white/90 px-1.5 py-0.5 sm:px-3 sm:py-1 text-[0.5rem] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-orange-600">
                  Pending
                </span>
              )}
              {admin.isApproved && admin.approvedBy && (
                <span className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full bg-white/90 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[0.45rem] sm:text-[0.6rem] font-semibold text-green-700 truncate max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]">
                  By: {admin.approvedBy.name || 'System'}
                </span>
              )}
            </div>

            {/* Card Body */}
            <div className="mt-2 sm:mt-5 flex flex-col gap-1 sm:gap-2">
              <h2 className="text-sm sm:text-xl font-bold text-slate-900 line-clamp-1 mb-1 sm:mb-2">{admin.name}</h2>
              
              <div className="flex items-center gap-1 sm:gap-2 text-gray-700 text-[0.65rem] sm:text-sm">
                <MdPhone className={`text-xs sm:text-base flex-shrink-0 ${
                  admin.isApproved ? 'text-green-500' : 'text-orange-500'
                }`} />
                <span className="font-medium truncate">{admin.mobile}</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-[0.6rem] sm:text-xs min-h-[1.5rem] sm:min-h-[2rem]">
                <BiTime className="text-xs sm:text-base text-gray-400 flex-shrink-0" />
                <span className="truncate">{formatDate(admin.createdAt)}</span>
              </div>
            </div>

            {/* Action Buttons - Only for pending admins */}
            {!admin.isApproved && (
              <div className="mt-3 sm:mt-6 flex gap-1 sm:gap-2">
                <button
                  onClick={() => onApprove(admin._id)}
                  className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 bg-green-500 text-white px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-[0.65rem] sm:text-sm font-semibold hover:bg-green-600 transition cursor-pointer"
                >
                  <FaCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Approve
                </button>
                <button
                  onClick={() => handleDeleteClick(admin)}
                  className="flex items-center justify-center bg-red-500 text-white px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl hover:bg-red-600 transition cursor-pointer"
                  title="Delete Admin"
                >
                  <FaTrash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            )}

            {/* Status badge with delete button - For approved admins */}
            {admin.isApproved && (
              <div className="mt-3 sm:mt-6 flex gap-1 sm:gap-2">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2.5 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1 text-green-700 text-[0.65rem] sm:text-sm font-semibold">
                    <FaCheckCircle className="w-3 h-3 sm:w-3 sm:h-3" />
                    Active Admin
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteClick(admin)}
                  className="flex items-center justify-center bg-red-500 text-white px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl hover:bg-red-600 transition cursor-pointer"
                  title="Delete Admin"
                >
                  <FaTrash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-xs w-full p-3 sm:p-5 animate-scale-in">
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                <FaTrash className="text-xl sm:text-2xl text-red-500" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center mb-1">
              Delete Admin?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">
              Delete <span className="font-semibold text-gray-800">{deleteConfirm.name}</span>? This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PendingAdminsTab;

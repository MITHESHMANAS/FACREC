const ConfirmModal = ({
    isOpen,
    title = "Confirm",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onClose
}) => {

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                <div className="border-b p-5">

                    <h2 className="text-xl font-bold">

                        {title}

                    </h2>

                </div>

                <div className="p-6">

                    <p className="text-gray-600">

                        {message}

                    </p>

                    <div className="flex justify-end gap-3 mt-8">

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2 rounded-lg border hover:bg-gray-100"
                        >

                            {cancelText}

                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >

                            {

                                loading

                                    ? "Deleting..."

                                    : confirmText

                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default ConfirmModal;
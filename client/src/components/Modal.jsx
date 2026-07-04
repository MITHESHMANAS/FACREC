const Modal = ({ isOpen, title, children, onClose }) => {

    console.log("Modal isOpen =", isOpen);
    if (!isOpen) return null;
    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

                <div className="flex justify-between items-center border-b p-5">

                    <h2 className="text-xl font-bold">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-red-600"
                    >
                        ×
                    </button>

                </div>

                <div className="p-6">

                    {children}

                </div>

            </div>

        </div>

    );

};

export default Modal;
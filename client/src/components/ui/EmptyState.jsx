import { FaInbox } from "react-icons/fa";

/**
 * The one "nothing here" block the whole app should use inside table/
 * list containers. `icon` takes a component reference (e.g. FaInbox,
 * not <FaInbox />) so it can be styled consistently; falls back to a
 * plain inbox glyph if omitted.
 */
const EmptyState = ({ icon: Icon = FaInbox, title, message, action = null }) => {

    return (

        <div className="flex flex-col items-center justify-center text-center py-16 px-6">

            <div className="w-16 h-16 rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-400 text-2xl mb-4">
                <Icon />
            </div>

            <h3 className="text-lg font-bold text-slate-700">
                {title}
            </h3>

            {
                message &&
                <p className="text-sm text-slate-400 mt-1.5 max-w-sm">
                    {message}
                </p>
            }

            {
                action &&
                <div className="mt-5">
                    {action}
                </div>
            }

        </div>

    );

};

export default EmptyState;

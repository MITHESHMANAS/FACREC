const StatsCard = ({ title, value, color }) => {

    return (

        <div className="card card-hover p-5">

            <p className="text-muted-cool text-sm font-medium">

                {title}

            </p>

            <h2 className={`font-mono-num text-3xl font-semibold mt-2 ${color}`}>

                {value}

            </h2>

        </div>

    );

};

export default StatsCard;

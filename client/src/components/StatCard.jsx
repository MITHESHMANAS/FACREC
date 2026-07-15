const StatCard = ({ title, value }) => {

    return (

        <div className="card card-hover p-6">

            <h3 className="text-muted-cool text-sm font-medium">

                {title}

            </h3>

            <h1 className="font-mono-num text-4xl font-semibold mt-2 text-ink">

                {value}

            </h1>

        </div>

    );

};

export default StatCard;

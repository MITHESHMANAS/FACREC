const profileService = require(
    "../services/studentProfileService"
);

const getStudentProfile = async (

    req,

    res

) => {

    try {

        const profile =

            await profileService.getStudentProfile(

                req.params.id

            );

        res.json({

            success: true,

            profile

        });

    }

    catch (err) {

        res.status(404).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    getStudentProfile

};
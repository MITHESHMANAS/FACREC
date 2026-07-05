const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const generateAttendanceExcel = async (

    session,

    attendance

) => {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Attendance");

    sheet.columns = [

        {

            header: "Roll No",

            key: "rollNo",

            width: 15

        },

        {

            header: "Name",

            key: "name",

            width: 25

        },

        {

            header: "Email",

            key: "email",

            width: 35

        },

        {

            header: "Status",

            key: "status",

            width: 15

        },

        {

            header: "Marked At",

            key: "time",

            width: 25

        }

    ];

    attendance.forEach(record => {

        sheet.addRow({

            rollNo: record.student.rollNo,

            name: record.student.name,

            email: record.student.email,

            status: record.status,

            time: record.markedAt

        });

    });

    const reportsDir = path.join(

        __dirname,

        "../../reports"

    );

    if (!fs.existsSync(reportsDir)) {

        fs.mkdirSync(

            reportsDir,

            {

                recursive: true

            }

        );

    }

    const fileName =

        `Attendance_${Date.now()}.xlsx`;

    const filePath = path.join(

        reportsDir,

        fileName

    );

    await workbook.xlsx.writeFile(

        filePath

    );

    return {

        fileName,

        filePath

    };

};

module.exports = {

    generateAttendanceExcel

};
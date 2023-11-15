const { Configuration, OpenAIApi } = require("openai");
const gpt = async (req) => {
    const configuration = new Configuration({
        organization: "org-vNI78NP64wPgm4EL50kD661O",
        apiKey: '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',
    });
    // const content = fs.readFileSync("req.txt");
    // const fileContent = content.toString();
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{"role": "system", "content": "You are a helpful assistant."}, {role: "user", content:req.data.input}],
    });
    // console.log(completion.data.choices[0].message);
    return JSON.parse(completion.data.choices[0].message.content);
  };

//   const getLogs = async (req) => {
//     const srv = await cds.connect.to('db');
//         try {
//             /** logic for inferred time*/
//             let bdgData = [];
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .from(RFLOG)
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             return result
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

//   const getTrans = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('USER_NAME AS User_Name', 'Log_Trans_Desc AS Log_Trans_Desc','Step_Description AS Step_Description', 'ROUND( SUM(Creation_Time) / 3600 ,2 ) AS Creation_Time')
//             .from(RFLOG)
//             .groupBy('USER_NAME','Step_Description','Log_Trans_Desc');
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

//   const getTimeTrans = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('USER_NAME','Log_Trans_Desc','ROUND((AVG(CREATION_TIME) / 3600),2) AS AVG_TIME_PER_TRANS')
//             .from(RFLOG)
//             .groupBy('USER_NAME','Log_Trans_Desc')
//             .orderBy('Log_Trans_Desc');
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };
  
//   const getActvtTime = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('Log_Activity_Desc','Log_Activity','User_Name','ROUND((SUM(CREATION_TIME) / 3600),2) AS TOT_ACTVT_TIME')
//             .from(RFLOG)
//             .groupBy('Log_Activity_Desc','Log_Activity','User_Name')
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

//   const getTransActvt = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('Log_Activity_Desc','COUNT(Log_Activity_Desc) AS actvt_count','LOGICAL_TRANSACTION')
//             .from(RFLOG)
//             .groupBy('LOGICAL_TRANSACTION','Log_Activity_Desc')
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

  
//   const getStepTime = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('Step_Description','ROUND((SUM(Creation_Time) / 3600 ),2) AS Creation_Time','Resource')
//             .from(RFLOG)
//             .groupBy('Resource','Step_Description')
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

//   const getResourceView = async (req) => {
//     rec = {};
//     record = [];
//     const srv = await cds.connect.to('db');
//         try {
//             const { RFLOG } = cds.entities;
//             let rfQuery = SELECT
//             .columns('Resource','ROUND((SUM(Creation_Time) / 3600 ),2) AS Creation_Time','Log_Trans_Desc','Step_Description')
//             .from(RFLOG)
//             .groupBy('Resource','Log_Trans_Desc','Step_Description')
//             console.log('Fetching RFLogs Data....');
//             let result = await srv.run(rfQuery);
//             req.data = result;
//             return req.data;
//             }
//         catch (e) {
//             req.reject(400, e);
//         }
//   };

module.exports = {
    gpt
    // getLogs,
    // getTrans,
    // getTimeTrans,
    // getActvtTime,
    // getTransActvt,
    // getStepTime,
    // getResourceView
  };
  
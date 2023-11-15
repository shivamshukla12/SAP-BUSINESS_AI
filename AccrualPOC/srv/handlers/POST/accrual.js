const cds = require('@sap/cds')
const cloudSDK = require("@sap-cloud-sdk/core");
cds.env.features.fetch_csrf = true
const { default: axios } = require("axios");
const postDoc = async (req) => {
  try {
    // const srv1 = await cds.connect.to("db");
    // const { AccuralsData, PostedAccuralsData } = cds.entities;
    // let AccrualDataQuery = SELECT.columns(
    //   "CCode AS CompanyCode",
    //   "Plant",
    //   "CostObjectType",
    //   "CostObjectNo",
    //   "Period",
    //   "SUM(AccuralAmount) AS AccuralAmount"
    // )
    //   .from(`${AccuralsData.name}`)
    //   .where(
    //     `CCode = '${req.data.CCode}' AND Plant = '${req.data.Plant}' AND Period = '${req.data.Period}'`
    //   )
    //   .groupBy("CCode", "Plant", "Period", "CostObjectType", "CostObjectNo");

    // let AccuralData = await srv1.run(AccrualDataQuery);

    // let PostAccrualDataQuery = SELECT.columns(
    //   "CCode AS CompanyCode",
    //   "Plant",
    //   "CostObjectType",
    //   "CostObjectNo",
    //   "Period",
    //   "DocumentNo",
    //   "SUM(PostedAccuralAmount) AS PostedAccuralAmount"
    // )
    //   .from(`${PostedAccuralsData.name}`)
    //   .where(
    //     `CCode = '${req.data.CCode}' AND Plant = '${req.data.Plant}' AND Period = '${req.data.Period}'`
    //   )
    //   .groupBy(
    //     "CCode",
    //     "Plant",
    //     "Period",
    //     "CostObjectType",
    //     "CostObjectNo",
    //     "DocumentNo"
    //   );
    // let PostData = await srv1.run(PostAccrualDataQuery);
    // let PostDataResult = [];
    // if (PostData.length > 0 && AccuralData.length > 0) {
    //   AccuralData.forEach((v) => {
    //     PostData.forEach((p) => {
    //       if (
    //         p.CostObjectType === v.CostObjectType &&
    //         p.CostObjectNo === v.CostObjectNo
    //       ) {
    //         PostDataResult.push(Object.assign({}, v, p));
    //       }
    //     });
    //   });
    // } else {
    //   PostDataResult = AccuralData;
    // }

    let resultData = [];
    let PostedAccural = [];
    let requestData = {};

    // Passing Headers Data
    requestData.CompanyCode = req.data.CCode;
    requestData.AccountingDocumentType = "SA";
    requestData.DocumentDate = convertIsoToJSEpoch(req.data.DocumentDate);
    requestData.PostingDate = convertIsoToJSEpoch(req.data.PostingDate);
    requestData.TransactionCurrency = "CAD";
    //Loop to pass the data Debit Lines
    // PostDataResult.forEach(function (Postdata) {
    //   let entry = {};
    //   entry.Plant = req.data.Plant;
    //   entry.GLAccount = "0000635200";
    //   entry.DocumentItemText = "TEST POSTING DEBIT ITEM";
    //   entry.BaseUnit = "EA";
    //   switch (Postdata.CostObjectType) {
    //     case "Cost Center":
    //       entry.CostCenter = Postdata.CostObjectNo;
    //       break;
    //     case "Work Order":
    //       entry.Order = Postdata.CostObjectNo;
    //       break;
    //     case "WBS":
    //       entry.WBSElement = Postdata.CostObjectNo;
    //       break;
    //     case "Network Id":
    //       entry.ProjectNetwork = Postdata.CostObjectNo;
    //       break;
    //     default:
    //       return;
    //   }

    //   var amount = 0.0;
    //   if (Postdata.PostedAccuralAmount) {
    //     amount = Postdata.AccuralAmount - Postdata.PostedAccuralAmount;
    //   } else {
    //     amount = Postdata.AccuralAmount;
    //   }

    //   entry.AmountInCoCodeCrcy = amount.toString();
    //   entry.DebitAmountInTransCrcy = amount.toString();
    //   entry.CompanyCode = Postdata.CompanyCode;
    //   entry.ProfitCenter = "CANADA";
    //   entry.TransactionCurrency = "CAD";
    //   resultData.push(entry);
    //   PostedAccural.push(entry);
    // });

    //Loop to pass the data Credit Lines
    // PostDataResult.forEach(function (PostdataCredit) {
    //   let entry = {};
    //   entry.Plant = req.data.Plant;
    //   entry.GLAccount = "0000200500";
    //   entry.DocumentItemText = "TEST POSTING CREDIT ITEM";
    //   entry.BaseUnit = "EA";
    //   switch (PostdataCredit.CostObjectType) {
    //     case "Cost Center":
    //       entry.CostCenter = PostdataCredit.CostObjectNo;
    //       break;
    //     case "Work Order":
    //       entry.Order = PostdataCredit.CostObjectNo;
    //       break;
    //     case "WBS":
    //       entry.WBSElement = PostdataCredit.CostObjectNo;
    //       break;
    //     case "Network Id":
    //       entry.ProjectNetwork = PostdataCredit.CostObjectNo;
    //       break;
    //     default:
    //       return;
    //   }
    //   var amount = 0.0;
    //   if (PostdataCredit.PostedAccuralAmount) {
    //     amount =
    //       PostdataCredit.AccuralAmount - PostdataCredit.PostedAccuralAmount;
    //   } else {
    //     amount = PostdataCredit.AccuralAmount;
    //   }
    //   entry.CreditAmountInTransCrcy = amount.toString();
    //   entry.CompanyCode = PostdataCredit.CompanyCode;
    //   entry.ProfitCenter = "CANADA";
    //   entry.TransactionCurrency = "CAD";
    //   entry.TaxCode = "I0";
    //   entry.TaxJurisdiction = "CAAB";
    //   resultData.push(entry);
    // });
    let finalResult = {};
    // if (resultData.length > 0) {
      // requestData.Items = resultData;
      const headers = req.headers

      let destination = await cloudSDK.getDestination("eh1");
   
      let requestConfig = await cloudSDK.buildHttpRequest(destination);
      let baseURL = requestConfig.baseURL + "/sap/opu/odata/sap/FAC_GL_DOCUMENT_POST_SRV/FinsPostingGLHeaders";
      requestConfig.method = "post";
      requestConfig.headers["Accept"] = requestConfig.headers["Content-Type"] = "application/json";
      requestConfig.data = requestData;
      requestConfig.baseURL = baseURL;
      let result = await axios.request(requestConfig);
      
      const srv = await cds.connect.to("eh1");
      // // let res_token = await srv.send({ method: 'GET', path: '/$metadata', requestData , headers:{['X-CSRF-Token']:'Fetch', Accept:'application/xml'} }) //> send HTTP request
      // cds.env.features.fetch_csrf = true;
      // let result = await srv.send({ method: 'POST', path: '/FinsPostingGLHeaders', requestData, headers });
      // // let result = await srv.post("/FinsPostingGLHeaders", requestData);
       
      baseURL = requestConfig.baseURL + "/sap/opu/odata/sap/FAC_GL_DOCUMENT_POST_SRV";
      var query = `/Post?TmpIdType='${result.TmpIdType}'&TmpId='${result.TmpId}'`;
      baseURL = baseURL + query;
      requestConfig.data = {};
      requestConfig.baseURL = baseURL;
      let fresult = await axios.request(requestConfig);
      // let fresult = await srv.post(query);

      finalResult.AccountingDocument = fresult.Post.AccountingDocument;
      finalResult.CCode = fresult.Post.CompanyCode;
      finalResult.FiscalYear = fresult.Post.FiscalYear;
      finalResult.Plant = req.data.Plant;
      finalResult.Period = req.data.Period;
      //let d = finalResult;
      if (finalResult.AccountingDocument) {
        let PostAccuralDataDB = [];
        //DB Insert in Posted Accural Data
        PostDataResult.forEach(function (PostedResult) {
          let entry = {};
          entry.CCode = req.data.CCode;
          entry.Plant = req.data.Plant;
          entry.CostObjectType = PostedResult.CostObjectType;
          entry.CostObjectNo = PostedResult.CostObjectNo;
          entry.period = req.data.Period;
          entry.DocumentNo = fresult.Post.AccountingDocument;
          if (PostedResult.PostedAccuralAmount) {
            entry.PostedAccuralAmount =
              PostedResult.AccuralAmount - PostedResult.PostedAccuralAmount;
          } else {
            entry.PostedAccuralAmount = PostedResult.AccuralAmount;
          }
          entry.PostingDate = req.data.PostingDate;
          PostAccuralDataDB.push(entry);
        });
        // const srv2 = await cds.connect.to("db");
        // await dbq.insertPostedAccuraldata(PostAccuralDataDB, srv2);
      }
    // }

    return finalResult;
  } catch (error) {
    req.reject(400, error);
  }
};

const convertIsoToJSEpoch = (isoDateTime) => {
  return "/Date(" + (new Date(isoDateTime)).getTime() + ")/"
}

module.exports = {
  postDoc
};
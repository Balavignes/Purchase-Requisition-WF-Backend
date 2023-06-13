const oauthClient = require("client-oauth2")
const express = require("express");
const request = require("request-promise");
const env = require("dotenv").config();
const e = require("express");
const axios = require('axios');
const xenv = require('@sap/xsenv');
const hdbext = require('@sap/hdbext');
const {
    json
} = require("express");
const {
    JWTStrategy
} = require('@sap/xssec');

// let hanasrv = xenv.getServices({ hana: { tag: 'hana' } });
const dest_service = xenv.getServices({
    dest: {
        tag: 'destination'
    }
}).dest;
const uaa_service = xenv.getServices({
    uaa: {
        tag: 'xsuaa'
    }
}).uaa;
const wf_service = xenv.getServices({
    workflow:{
        label: 'workflow'
    }
}).workflow.uaa;
const sUaaCredentials = dest_service.clientid + ':' + dest_service.clientsecret;

// const wf_service = xenv.getSer
console.log("wfservice : " + JSON.stringify(wf_service));
let base = wf_service.url;
let CLIENT_ID = wf_service.clientid;
let APP_SECRET = wf_service.clientsecret;

//DEV
// base="https://p001-comau-dev.authentication.eu10.hana.ondemand.com";
// CLIENT_ID = "sb-clone-8b8c952a-77ac-4989-a110-cddc03175625!b21758|workflow!b10150";
// APP_SECRET = "afcd46fe-2a6f-481c-a16f-9acc1854be4b$qlpE2gKfmhQkbANgBOtO5HookKy4n-5Iwsfb6GHnmYg=";

//QAS
// base = "https://comau.authentication.eu10.hana.ondemand.com";
// CLIENT_ID = "sb-clone-0fab14a4-82c1-4f5d-a84c-30f76487a61a!b28705|workflow!b10150";
// APP_SECRET = "700607de-a7eb-4d85-883a-95aaa6fa930c$FEPnw1od_GY6dQtBgBDsdYlP1S_T-93jzecogMFY3D0=";

const app = express();
const PORT = process.env.PORT || 3000;
const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
const XSUAA_CLIENTID = VCAP_SERVICES.xsuaa[0].credentials.clientid;
const XSUAA_CLIENTSECRET = VCAP_SERVICES.xsuaa[0].credentials.clientsecret;
const XSUAA_URL = VCAP_SERVICES.xsuaa[0].credentials.url;

var SLServer = null;
var b1Route = null;
var b1Dest = null;

const callDestination = require('sap-cf-destination');
app.use(express.json())

let payload = {
    "definitionId": "comau.dev.pr1.comauworkflow",
    "context": {}
}

// function insertCklData(cklData) {
//     var hanaConfig = xenv.cfServiceCredentials({
//         tag: 'hana'
//     });
//     console.log("***Insert Query***");
//     hdbext.createConnection(hanaConfig, function (error, client) {
//         if (error) {
//             return console.error("error while creating connection :" + error);
//         }
//         client.exec('INSERT INTO "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_CHECKLISTINSTANCES" VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
//             [cklData.Plant, "", "", 0, cklData.ProdOrder, cklData.Operation, cklData.WorkCenter, "", "", cklData.Id, 1, 1, "", 1, "", "", "", "", 1, "", 1, "", 1, "", "", "", cklData.Maincluster, cklData.Subcluster,
//                 cklData.Reasoncode, cklData.ReasonDesc, "", "", cklData.Note, "", new Date(), "", "", cklData.UserCid, "", "", "", "", "", "", "", "", "", ""
//             ],
//             (err) => {
//                 if (err) {
//                     console.log("error on insert:" + err);
//                 }
//             });
//     });
// }

function insertData(prPayload) {
    var hanaConfig = xenv.cfServiceCredentials({
        tag: 'hana'
    });
    console.log("***Insert Query***");
    hdbext.createConnection(hanaConfig, function (error, client) {
            if (error) {
                return console.error("error while creating connection :" + error);
            }
            client.exec('INSERT INTO "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    [prPayload.PurchaseRequisition, prPayload.PrItemNumber,
                        prPayload.wfInstance, "", "", "", "",
                        prPayload.approvalLevel, "",
                        prPayload.PrDocType, prPayload.PrDocumentTypeDesc,
                        prPayload.ReleaseStatus, prPayload.ReleaseStrategyInPr, prPayload.PurchasingGroup, prPayload.PurchasingGroupDesc,
                        prPayload.Creator, prPayload.RoomNumber,
                        prPayload.RequestorHeadEmailAddress, prPayload.NameOfRequester,
                        prPayload.MaterialNumber,
                        prPayload.MaterialDesc,
                        prPayload.Plant, prPayload.PlantDesc,
                        prPayload.MaterialGroup, prPayload.MaterialGroupDesc,
                        prPayload.PrQuantity,
                        prPayload.PrUnitOfMeasure,
                    new Date(parseInt(prPayload.PrDate.substr(6, 19))).toISOString(),
                    new Date(parseInt(prPayload.ItemDeliveryDate.substr(6, 19))).toISOString(),
                    new Date(parseInt(prPayload.PrReleaseDate.substr(6, 19))).toISOString(),
                    prPayload.PriceInPr,
                    prPayload.ItemCatInPurchDoc, prPayload.ItemCatInPurchDocDesc,
                    prPayload.AccAssignCat, prPayload.AccAssignCatDesc,
                    prPayload.PurchasingOrganization, prPayload.PurchasingOrganizationDesc,
                    prPayload.LocalCurrencyKey, "",
                    prPayload.WbsElement, prPayload.WbsElementDesc,
                    prPayload.GlAccount,
                    prPayload.BusinessArea, prPayload.BusinessAreaDesc,
                    prPayload.CostCenter, prPayload.CostCenterDesc,
                    prPayload.CompanyCode, prPayload.CompanyCodeDesc,
                    prPayload.DeletionIndicator,
                    prPayload.Note,
                    prPayload.Link,
                    prPayload.WbsType,
                    prPayload.AcuAmount,
                    prPayload.AcuAmountCurr,
                    prPayload.CreatorName,
                    prPayload.CreatorSurname,
                    prPayload.CreatorEmailAddress,
                    prPayload.ProjectDefinition,
                    prPayload.ProjectDefinitionDesc,
                    prPayload.PriceInPr,
                    prPayload.LocalCurrencyKey,
                    prPayload.LocalTotalAmount,
                    prPayload.GlobalCurrencyKey,
                    prPayload.GlobalTotalAmount,
                    prPayload.ProductionOrder,
                    prPayload.SalesDocNumber,
                    prPayload.SalesDocItem,
                    prPayload.CreationIndicator,
                ],
                (err) => {
                    if (err) {
                        console.log("error on insert:" + err);
                    }
                });
    });
}

function updateCancelInd(prPayload, wfInstance) {
    var hanaConfig = xenv.cfServiceCredentials({
        tag: 'hana'
    });
    console.log("***Update cancel indicator***" + JSON.stringify(prPayload));
    console.log("prid :" + prPayload.PurchaseRequisition);
    console.log("itemnr : " + parseInt(prPayload.PrItemNumber));
    console.log("workflow inst : " + wfInstance);
    hdbext.createConnection(hanaConfig, function (error, client) {
        if (error) {
            return console.error("error while creating connection :" + error);
        }
        client.exec('UPDATE "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" SET "CANCEL_IND" = ? WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "INSTANCE_ID" = ?',
            ['X', prPayload.PurchaseRequisition, parseInt(prPayload.PrItemNumber), wfInstance],
            (err, res) => {
                if (err) {
                    console.log("error on update:" + err);
                } else if (res) {
                    console.log("result :" + res);
                }
            });
    });
}

function updateChangeInd(prPayload, wfInstance) {
    var hanaConfig = xenv.cfServiceCredentials({
        tag: 'hana'
    });
    console.log("***Update change indicator***" + JSON.stringify(prPayload));
    console.log("prid :" + prPayload.PurchaseRequisition);
    console.log("itemnr : " + parseInt(prPayload.PrItemNumber));
    console.log("workflow inst : " + wfInstance);
    // var wfInstance =  "'" + prPayload.wfInstance + "'";
    hdbext.createConnection(hanaConfig, function (error, client) {
        if (error) {
            return console.error("error while creating connection :" + error);
        }
        client.exec('UPDATE "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" SET "CHANGE_IND" = ? WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "INSTANCE_ID" = ?',
            ['X', prPayload.PurchaseRequisition, parseInt(prPayload.PrItemNumber), wfInstance],
            (err, res) => {
                if (err) {
                    console.log("error on update:" + err);
                } else if (res) {
                    console.log("result :" + res);
                }
            });
        // console.log("Statement to change:" + stmt);
        // stmt.exec();
    });
}

async function getCAQTestData() {
    console.log("Test data called" + uaa_service.url);
    console.log("VCAP services" + JSON.stringify(VCAP_SERVICES));
    var sDestinationName = "SAPCAQBackground";
    var response = {};
    return new Promise((resolve, reject) => {
        request({
            uri: uaa_service.url + '/oauth/token',
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
                'Content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                'client_id': dest_service.clientid,
                'grant_type': 'client_credentials'
            }
        }).then((data) => {
            const token = JSON.parse(data).access_token;
            console.log("reached here :" + token);
            return request({
                uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        }).then(async (result) => {
            console.log("reached here too" + result);
            var destination = JSON.parse(result);
            console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
            var user = destination.destinationConfiguration.User;
            var password = destination.destinationConfiguration.Password
            var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/CAQ/sap/opu/odata/sap/ZGW_SCP_PRWF_STAG_SRV/outtabSet?$filter=Zparameter eq 'X' and PurchaseRequisition eq ' ' and PrItemNumber eq ' '"
            const res = await axios({
                url: URL,
                method: 'GET',
                auth: {
                    username: destination.destinationConfiguration.User,
                    password: destination.destinationConfiguration.Password
                }
            });
            res.data.d.results.forEach(element => {
                delete element['__metadata']
            });
            console.log("inside test data :" + JSON.stringify(res.data.d.results));
            resolve(res.data.d.results);
        });
    });
}

async function getTestData() {
    console.log("Test data called" + uaa_service.url);
    console.log("VCAP services" + JSON.stringify(VCAP_SERVICES));
    var sDestinationName = "SAPCOQBackground";
    var response = {};
    return new Promise((resolve, reject) => {
        request({
            uri: uaa_service.url + '/oauth/token',
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
                'Content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                'client_id': dest_service.clientid,
                'grant_type': 'client_credentials'
            }
        }).then((data) => {
            const token = JSON.parse(data).access_token;
            console.log("reached here :" + token);
            return request({
                uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        }).then(async (result) => {
            console.log("reached here too" + result);
            var destination = JSON.parse(result);
            console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
            var user = destination.destinationConfiguration.User;
            var password = destination.destinationConfiguration.Password
            console.log("confg " + user);
            //TODO find a way to call api from approuter
            var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/backend/sap/opu/odata/sap/ZGW_SCP_PRWF_STAG_SRV/outtabSet?$filter=Zparameter eq 'X' and PurchaseRequisition eq ' ' and PrItemNumber eq ' '"
            const res = await axios({
                url: URL,
                method: 'GET',
                auth: {
                    username: destination.destinationConfiguration.User,
                    password: destination.destinationConfiguration.Password
                }
            });
            res.data.d.results.forEach(element => {
                delete element['__metadata']
            });
            console.log("inside test data :" + JSON.stringify(res.data.d.results));
            resolve(res.data.d.results);
        });
    });
}

async function generateAccessToken() {
    const response = await axios({
        url: base + "/oauth/token",
        method: "post",
        data: "grant_type=client_credentials",
        auth: {
            username: CLIENT_ID,
            password: APP_SECRET,
        },
    });
    return response.data;
}

async function checkExistingWorkflow(payload, oAuthToken) {
    let get_taskurl = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/task-instances";
    let headers = {
        'Authorization': 'Bearer ' + oAuthToken
    };
    const params = {
        '$orderby': 'createdAt desc',
        'Subject': payload.context.PurchaseReq.PurchaseRequisition + "-" + payload.context.PurchaseReq.PrItemNumber
    };
    console.log("parameters :" + JSON.stringify(params));
    const prData = await axios.get(get_taskurl, {
        headers,
        params
    }).then(console.log("Existing task found"));
    console.log("Existing task:" + JSON.stringify(prData.data));
    const readyData = [];
    for (var i in prData.data) {
        // if (prData.data[i].status == "READY") {
        let get_taskInstance = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/task-instances/" + prData.data[i].id + "/context";
        let headers = {
            'Authorization': 'Bearer ' + oAuthToken
        };
        console.log("get_task instance URL" + get_taskInstance);
        const prInstanceData = await axios.get(get_taskInstance, {
            headers
        }).then(console.log("Existing task context found"));
        console.log("task context:" + JSON.stringify(prInstanceData.data));
        if (prInstanceData.data.PurchaseReq.Plant == payload.context.PurchaseReq.Plant) {
            console.log("A instance found with same data");
            prInstanceData.data.workflowInstanceId = prData.data[i].workflowInstanceId;
            readyData.push(prInstanceData.data);
        }
        // }
    }
    console.log("ready data count:" + readyData.length)
    return readyData;
}

async function deleteWorkflow(wfData, prTask, oAuthToken) {
    //check the running status of the instance
    const headers = {
        'Authorization': 'Bearer ' + oAuthToken
    };
    let url = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances";
    const wfInstance = prTask.workflowInstanceId;
    // let wfData = await axios.get(url + "/" + wfInstance,{headers}).then(console.log("Existing workflow found"));
    // console.log("get wf :" + JSON.stringify(wfData.data));
    if (wfData.data.status != "CANCELED") {
        let body = [{
            "id": wfInstance,
            "deleted": true
        }]
        console.log("delete api being called");
        await axios.patch(url, body, {
            headers
        }).then(console.log("Workflow instance deleted"))
    }
}

async function createWorkflow(payload, oAuthToken) {
    console.log("create workflow called");
    let url = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances";
    payload.context.PurchaseReq.approvalLevel = 1;
    const headers = {
        'Authorization': 'Bearer ' + oAuthToken
    };
    console.log(JSON.stringify(headers));
    const response = await axios.post(url, payload, {
        headers
    }).then(console.log("workflow instance created"));
    console.log(JSON.stringify(response.data));
    return response.data;
}

app.get("/", (req, res, next) => {
    res.send("Welcome to employee dashboard");
});

app.get('/USheader', async (req, res) => {
    // res.send("called header API");
    try {
        let wfInstanceResp = {};
        const data = await getCAQTestData();
        console.log("Response data is" + JSON.stringify(data));
        data.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        console.log("Sorted Response data is" + JSON.stringify(data));
        const token = await generateAccessToken();
        var oAuthToken = token.access_token;
        console.log("OauthToken" + JSON.stringify(oAuthToken));
        let url = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances";
        const headers = {
            'Authorization': 'Bearer ' + oAuthToken
        };
        for (var i in data) {
            payload.context.PurchaseReq = {};
            payload.context.PurchaseReq = data[i];
            const prTask = await checkExistingWorkflow(payload, oAuthToken);
            if (prTask.length) {
                // for (var i in prTask) {
                const wfInstance = prTask[0].workflowInstanceId;
                console.log("url :" + url + "/" + wfInstance);
                let wfData = await axios.get(url + "/" + wfInstance, {
                    headers
                }).then(console.log("Existing workflow found"));
                console.log("get wf :" + JSON.stringify(wfData.data))
                if (payload.context.PurchaseReq.DeletionIndicator || payload.context.PurchaseReq.DeletionIndicator == 'X' || payload.context.PurchaseReq.ReleaseStatus != 'XX') {
                    if (wfData.data.status != "CANCELED") {
                        await deleteWorkflow(wfData, prTask[0], oAuthToken);
                        // payload.context.PurchaseReq.CancelIndicator = "X";
                        updateCancelInd(payload.context.PurchaseReq, wfInstance);
                        // l(payload.context.PurchaseReq, wfInstance);
                    } else {
                        // payload.context.PurchaseReq.CancelIndicator = "X";
                        updateCancelInd(payload.context.PurchaseReq, wfInstance);
                    }
                } else {
                    if (wfData.data.status != "CANCELED") {
                        await deleteWorkflow(wfData, prTask[0], oAuthToken);
                        console.log("instance id old:" + wfInstance);
                        // payload.context.PurchaseReq.wfInstance = wfInstance;
                        updateChangeInd(payload.context.PurchaseReq, wfInstance);
                        payload.context.PurchaseReq.wfInstance = "";
                        wfInstanceResp = await createWorkflow(payload, oAuthToken);
                        console.log("instance id new:" + wfInstanceResp.rootInstanceId);
                        payload.context.PurchaseReq.wfInstance = wfInstanceResp.rootInstanceId;
                        // await updateWorkflow(payload, oAuthToken);(use this if indicator method doesn't work)
                        insertData(payload.context.PurchaseReq);
                    } else {
                        console.log("instance id old:" + wfInstance);
                        // payload.context.PurchaseReq.wfInstance = wfInstance;
                        updateChangeInd(payload.context.PurchaseReq, wfInstance);
                        payload.context.PurchaseReq.wfInstance = "";
                        wfInstanceResp = await createWorkflow(payload, oAuthToken);
                        console.log("instance id new:" + wfInstanceResp.rootInstanceId);
                        payload.context.PurchaseReq.wfInstance = wfInstanceResp.rootInstanceId;
                        // await updateWorkflow(payload, oAuthToken);(use this if indicator method doesn't work)
                        insertData(payload.context.PurchaseReq);
                    }
                }
                // }
            } else {
                console.log("payload :" + JSON.stringify(payload));
                //TODO condition to be checked with real data
                if (!payload.context.PurchaseReq.DeletionIndicator && payload.context.PurchaseReq.ReleaseStatus == 'XX') {
                    wfInstanceResp = await createWorkflow(payload, oAuthToken);
                }
                payload.context.PurchaseReq.wfInstance = wfInstanceResp && wfInstanceResp.rootInstanceId ? wfInstanceResp.rootInstanceId : "";
                // await updateWorkflow(payload, oAuthToken);(use this if indicator method doesn't work)
                insertData(payload.context.PurchaseReq);
            }
        }
        res.send(data);
    } catch (err) {
        console.log("error from bigger scope :" + err.message)
        res.send(err);
    }
})

// async function getCKLTestData() {
//     console.log("CKL Test data called" + uaa_service.url);
//     console.log("VCAP services" + JSON.stringify(VCAP_SERVICES));
//     var sDestinationName = "SAPCOQBackground";
//     var response = {};
//     return new Promise((resolve, reject) => {
//         request({
//             uri: uaa_service.url + '/oauth/token',
//             method: 'POST',
//             headers: {
//                 'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
//                 'Content-type': 'application/x-www-form-urlencoded'
//             },
//             form: {
//                 'client_id': dest_service.clientid,
//                 'grant_type': 'client_credentials'
//             }
//         }).then((data) => {
//             const token = JSON.parse(data).access_token;
//             console.log("reached here :" + token);
//             return request({
//                 uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
//                 headers: {
//                     'Authorization': 'Bearer ' + token
//                 }
//             });
//         }).then(async (result) => {
//             console.log("reached here too" + JSON.stringify(result));
//             var destination = JSON.parse(result);
//             console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
//             var user = destination.destinationConfiguration.User;
//             var password = destination.destinationConfiguration.Password
//             console.log("confg " + user);
//             var plant = "0602";
//             var ProdOrd = "12345";
//             var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/backend/sap/opu/odata/sap/ZGW_NJO_BTP_STAGING_SRV/OutTabSetSet?$filter=Plant eq '" + plant + "' and ProdOrder eq '" + ProdOrd + "' and Operation eq ' '"
//             // var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/backend/sap/opu/odata/sap/ZGW_SCP_PRWF_STAG_SRV/outtabSet?$filter=Zparameter eq 'X' and PurchaseRequisition eq ' ' and PrItemNumber eq ' '"
//             console.log(URL);
//             const res = await axios({
//                 url: URL,
//                 method: 'GET',
//                 auth: {
//                     username: destination.destinationConfiguration.User,
//                     password: destination.destinationConfiguration.Password
//                 }
//             });
//             res.data.d.results.forEach(element => {
//                 delete element['__metadata']
//             });
//             console.log("inside test data :" + JSON.stringify(res.data));
//             resolve(res.data);
//         });
//     });
// }

// app.get('/cklInstance', async (req, res) => {
//     // res.send("called header API");
//     try {
//         const data = await getCKLTestData();
//         console.log("Response data is" + JSON.stringify(data));
//         insertCklData(data);
//         res.send(data);
//     } catch (err) {
//         console.log("error from bigger scope :" + err.message)
//         res.send(err);
//     }
// })

app.get('/header', async (req, res) => {
    // res.send("called header API");
    try {
        let wfInstanceResp = {};
        const data = await getTestData();
        console.log("Response data is" + JSON.stringify(data));
        data.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        console.log("Sorted Response data is" + JSON.stringify(data));
        const token = await generateAccessToken();
        var oAuthToken = token.access_token;
        console.log("OauthToken" + JSON.stringify(oAuthToken));
        let url = "https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances";
        const headers = {
            'Authorization': 'Bearer ' + oAuthToken
        };
        for (var i in data) {
            payload.context.PurchaseReq = {};
            payload.context.PurchaseReq = data[i];
            // payload.context.PurchaseReq.Purchaserequisition = "00001";
            // payload.context.PurchaseReq.ItemNr = "123"
            const prTask = await checkExistingWorkflow(payload, oAuthToken);
            if (prTask.length) {
                // for (var i in prTask) {
                //As the query in check existing workflow is sorted by descending created at first one is latest created 
                const wfInstance = prTask[0].workflowInstanceId;
                console.log("url :" + url + "/" + wfInstance);
                let wfData = await axios.get(url + "/" + wfInstance, {
                    headers
                }).then(console.log("Existing workflow found"));
                console.log("get wf :" + JSON.stringify(wfData.data))
                if (payload.context.PurchaseReq.DeletionIndicator || payload.context.PurchaseReq.DeletionIndicator == 'X' || payload.context.PurchaseReq.ReleaseStatus != 'XX') {
                    if (wfData.data.status != "CANCELED") {
                        await deleteWorkflow(wfData, prTask[0], oAuthToken);
                        // payload.context.PurchaseReq.CancelIndicator = "X";
                        updateCancelInd(payload.context.PurchaseReq, wfInstance);
                    } else {
                        // payload.context.PurchaseReq.CancelIndicator = "X";
                        updateCancelInd(payload.context.PurchaseReq, wfInstance);
                    }
                } else {
                    if (wfData.data.status != "CANCELED") {
                        await deleteWorkflow(wfData, prTask[0], oAuthToken);
                        console.log("instance id old:" + wfInstance);
                        // payload.context.PurchaseReq.wfInstance = wfInstance;
                        updateChangeInd(payload.context.PurchaseReq, wfInstance);
                        payload.context.PurchaseReq.wfInstance = "";
                        wfInstanceResp = await createWorkflow(payload, oAuthToken);
                        console.log("instance id new:" + wfInstanceResp.rootInstanceId);
                        payload.context.PurchaseReq.wfInstance = wfInstanceResp.rootInstanceId;
                        insertData(payload.context.PurchaseReq);
                    } else {
                        console.log("instance id old:" + wfInstance);
                        payload.context.PurchaseReq.wfInstance = wfInstance;
                        updateChangeInd(payload.context.PurchaseReq, wfInstance);
                        payload.context.PurchaseReq.wfInstance = "";
                        wfInstanceResp = await createWorkflow(payload, oAuthToken);
                        console.log("instance id new:" + wfInstanceResp.rootInstanceId);
                        payload.context.PurchaseReq.wfInstance = wfInstanceResp.rootInstanceId;
                        insertData(payload.context.PurchaseReq);
                    }
                }
                // }
            } else {
                console.log("payload :" + JSON.stringify(payload));
                //TODO condition to be checked with real data
                if (!payload.context.PurchaseReq.DeletionIndicator && payload.context.PurchaseReq.ReleaseStatus == 'XX') {
                    wfInstanceResp = await createWorkflow(payload, oAuthToken);
                }
                payload.context.PurchaseReq.wfInstance = wfInstanceResp && wfInstanceResp.rootInstanceId ? wfInstanceResp.rootInstanceId : "";
                insertData(payload.context.PurchaseReq);
            }
        }
        res.send(data);
    } catch (err) {
        console.log("error from bigger scope :" + err.message)
        res.send(err);
    }
})
app.listen(PORT, console.log(`Listening on port ${PORT}`));
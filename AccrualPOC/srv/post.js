const call_api = require('./handlers/POST/accrual');

module.exports = cds.service.impl(async function () {
  this.on("POST", "PostDoc", call_api.postDoc);
});
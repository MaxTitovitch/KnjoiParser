let {Saver} = require("./services/Saver");

let CronJob = require('cron').CronJob;
let job = new CronJob('0 */20 * * * *', function() {
  let saver = new Saver();
  saver.startWork();
});
job.start();
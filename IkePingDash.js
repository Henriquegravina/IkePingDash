/* 

  IkePingDash - A Small application to monitor
  hosts. Its mean to be simple

*/

const { exec } = require('child_process');
const fs = require('fs')

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var path = require('path');
const express = require('express')



var path = require('path');
dir = path.join(__dirname);

// Read hosts list from config/hosts.json file
const hosts_list = JSON.parse(fs.readFileSync(dir + '/config/hosts.json'));

// Read groups definitions
const groups_list = JSON.parse(fs.readFileSync(dir + '/config/groups.json'));



// When a client connects, send the host list
io.on('connection', function(socket){
  io.emit('groups_list', groups_list);
  io.emit('hosts_list', hosts_list);

  // Ping all hosts and send the results to clients
  pingAllHosts(hosts_list);
});

// Ping all hosts and emit socket results, one by one
async function pingAllHosts(hosts) {
  for (const element of hosts) {
    const result = await pingHost(element.address);
    const host_result = { "id": element.id, "host_status": result.result };
    io.emit('result', host_result);
  }
}

// Ping a host 
function pingHost(host) {
  return new Promise((resolve, reject) => {
    exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ host, result: 0 });
      } else {
        resolve({ host, result: 1 });
      }
    });
  });
}

// Timer to ping all hosts
setInterval(() => {
  pingAllHosts(hosts_list);
}, 30000); // 30 seconds

// 
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/html/dashboard.html');
});

var dir = path.join(__dirname, '/html');
app.use(express.static(dir));

// Start the server
http.listen(3500, function() {
  console.log('Listening on *:3500');
});
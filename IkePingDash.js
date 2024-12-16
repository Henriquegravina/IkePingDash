/* 

  IkePingDash - A Small application to monitor
  hosts. Its mean to be simple

*/

const { exec } = require("child_process");
const fs = require("fs");


const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Default values when config files does not exist:
// hosts.json
const defaultHostsContent = [ 
  { "id": "hostLocal",  "caption": "LocalHost",  "address": "127.0.0.1",  "group": "g1" },
  { "id": "host99", "caption": "Google", "address": "8.8.8.8", "group": "g2" }
];
// goups.json
const defaultGroupsContent = [
    { "id": "g1", "name": "Appliances" },
    { "id": "g2", "name": "Internet" }
  ];



var path = require("path");
const dir = __dirname; // App dir
const configPath = path.join(dir, "config"); 

const hostsFilePath = path.join(configPath, "hosts.json");
const groupsFilePath = path.join(configPath, "groups.json");

if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath);
}


if (!fs.existsSync(hostsFilePath)) {
  fs.writeFileSync(hostsFilePath, JSON.stringify(defaultHostsContent, null, 2));
}

if (!fs.existsSync(groupsFilePath)) {
  fs.writeFileSync(groupsFilePath, JSON.stringify(defaultGroupsContent, null, 2));
}

// Read hosts list from config/hosts.json file
const hosts_list = JSON.parse(fs.readFileSync(hostsFilePath));
const groups_list = JSON.parse(fs.readFileSync(groupsFilePath));





// When a client connects, send the host list
io.on("connection", function (socket) {
  io.emit("groups_list", groups_list);

  hosts_list.forEach((element) => {
    io.emit("hosts_list", {
      id: element.id,
      caption: element.caption,
      group: element.group,
    });
  });

  // Ping all hosts and send the results to clients
  pingAllHosts(hosts_list);
});

// Ping all hosts and emit socket results.
async function pingAllHosts(hosts) {
  const pingPromises = hosts.map(async (element) => {
    const result = await pingHost(element.address);
    const host_result = { id: element.id, host_status: result.result };
    io.emit("result", host_result);
    return host_result;
  });

  const results = await Promise.all(pingPromises);
}

// Ping a host
function pingHost(host) {
  return new Promise((resolve, reject) => {
    console.log(`ping to ${host}`);
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
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/html/dashboard.html");
});

var html_dir = path.join(__dirname, "/html");
app.use(express.static(html_dir));

// Start the server
server.listen(3500, function () {
  console.log("Listening on *:3500");
});

module.exports = app;

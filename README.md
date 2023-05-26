# IkePingDash

This is a simple JS app to monitor if some hosts are UP by ping them.
Its possible to create group of hosts like Server, Networks etc... and
every 30 seconds a ping is sent to each host.

If the host respond to the ping it´s label goes green, if not goes red.

To use:

 ```sh  
git clone https://github.com/Henriquegravina/IkePingDash.git
cd IkePingDash
npm install
node IkePingDash.js
```


Service will be up on http://ip-addr:3500/
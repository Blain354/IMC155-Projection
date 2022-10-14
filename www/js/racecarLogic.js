var rbServer = null;
var root = null;
//Some initializations after the page has been shown
$(document).ready(function(){
    root = document.querySelector(':root');
    connectROS('192.168.1.26');
});
// Define some functions
function connectROS(ipAddr) {
    rbServer = new ROSLIB.Ros({
        url : `ws://${ipAddr}:9090`
    });

    rbServer.on('connection', function(){
        // Create a topic object to subscribe (SCAN)
        var listenerSteer = new ROSLIB.Topic({
            ros : rbServer,
            name : '/racecar/prop_cmd',
            messageType : 'geometry_msgs/Twist'
        });
        listenerSteer.subscribe(function(message) {
            console.log(message.angular.z*-50);
            // $('#containerNextPath').css('transfrom', `rotate(${message.angular.z*50}deg)`);
            document.documentElement.style.setProperty(`--angle`,message.angular.z*-50+'deg');
        });
    });

    rbServer.on('error', function(error) {
        console.log('Error connecting to websocket server');
    });

    rbServer.on('close', function() {
        console.log('Connection to websocket server closed');
    });    
}

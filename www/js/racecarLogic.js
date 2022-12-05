var rbServer = null;
var root = null;
var pointsY = [];
var pointsX = [];
var AllPoints = [];
var frontValueRange = 0.045;
var frontValueThreshold = 1.0;
var minValue = 0.35;
var sound = document.getElementById("sound");
sound.volume = 1.0;
var arrows;
var blue = "rgb(66, 154, 255)";
var red = "rgb(255, 59, 59)";


//Some initializations after the page has been shown
$(document).ready(function(){
    arrows = document.getElementById("containerNextPath");
    root = document.querySelector(':root');
    connectROS('localhost');
});
// Define some functions
function connectROS(ipAddr) {
    rbServer = new ROSLIB.Ros({
        url : `ws://${ipAddr}:9090`
    });

    rbServer.on('connection', function(){
        var cmdProximity = new ROSLIB.Topic({
            ros : rbServer,
            name : '/racecar/proximity',
            messageType : 'std_msgs/Bool'
        });

        var listenerSteer = new ROSLIB.Topic({
            ros : rbServer,
            name : '/racecar/prop_cmd',
            messageType : 'geometry_msgs/Twist'
        });
        listenerSteer.subscribe(function(message) {
            if(message.angular.z == 0.0){
                document.documentElement.style.setProperty(`--angle`,(message.angular.z*-50)+'deg');
            } else {
                document.documentElement.style.setProperty(`--angle`,(message.angular.z*-50-4.12)+'deg');
            }
        });

        // Create a topic object to subscribe (SCAN)
        var listenerScan = new ROSLIB.Topic({
            ros : rbServer,
            name : '/racecar/scan',
            messageType : 'sensor_msgs/LaserScan'
        });
        listenerScan.subscribe(function(message) {
            laser_scan = message;
            compute_points(laser_scan);
            let proximity = isProximity();
            console.log(proximity);
            cmdProximity.publish(new ROSLIB.Message({data: proximity}));
        });
    });

    rbServer.on('error', function(error) {
        console.log('Error connecting to websocket server');
    });

    rbServer.on('close', function() {
        console.log('Connection to websocket server closed');
    });    
}


function compute_points(scan) {
    pointsY = [];
    pointsX = [];
    AllPoints = [];
    let angle_min = scan['angle_min'];
    let angle = angle_min;
    let angle_increment = scan['angle_increment'];
    let range_max = scan['range_max'];
    let range_min = scan['range_min'];
    let ranges = scan['ranges'];
    let ranges_length = ranges.length;
    for (let i = 0; i < ranges_length; i++) {
        let range = scan.ranges[i];
        if (range < range_min|| range > range_max) {
            angle += angle_increment;
            continue;
        }
        let y = range * Math.cos(angle);
        let x = range * Math.sin(angle);
        AllPoints.push([x,y]);
        if(x > -frontValueRange && x < frontValueRange && y < 0){
            pointsY.push(Math.abs(y));
            pointsX.push(x);
        }
        angle += scan.angle_increment;
    }

};

function isProximity(){
    let moyenne = pointsY.reduce((a, b) => a + b, 0) / pointsY.length;
    if(moyenne < frontValueThreshold){
        sound.playbackRate = 1.8 - Math.abs((moyenne - minValue)/(frontValueThreshold - minValue));
        sound.play();
        document.documentElement.style.setProperty(`--back_color`,"red");
        return true;
    } else {
        sound.pause();
        sound.currentTime = 0;
        document.documentElement.style.setProperty(`--back_color`,blue);
        return false;
    }
}

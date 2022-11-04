#!/usr/bin/env python

import rospy
from std_msgs.msg import Bool

class ProximityHandler:
    def __init__(self):

        self._proximity_sub = rospy.Subscriber('/racecar/proximity', Bool, self.proximity_cb, queue_size=1)
        print('init')

    def proximity_cb(self, msg):
        print(msg.data)

def main():
    rospy.init_node('proximity_handler')
    proximityHandler = ProximityHandler()
    r = rospy.Rate(1)
    while not rospy.is_shutdown():
        try:
            r.sleep()
        except rospy.ROSInterruptException:
            pass

if __name__ == '__main__':
    main()


# Radwag-mass
Node-red 

Radwag-mass node enables obtaining mass result from Radwag devices via TCP connection.

Remember to set the PC/Computer communication port of a scale or a terminal to TCP/Ethernet/Wifi, depending on the scale/terminal type.

The payload description :

	mass: The net value of mass
	unit: Current unit
	tare: The tare value
	stab: Determines stability
	zero: Determines if mass is in zero range
	range: Describes current range - mostly important when scale is multi-range
	digit: Determines count of highlighted digits when scale is legalized
	hidden: Determines count of hidden digits when scale is legalized
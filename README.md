# Philips TV Ambiligt -> Philips Hue

This project was created in order to be able to fetch colors from your Philips Ambilight TV and send these colors to your Philips Hue Lights. There are mobile apps doing the same but they will quickly drain your battery since there are a lot of Network Requests going on in order to achieve this.

This project is currently dependent on a related Mobile app that is being used to _control_ the behavoiur of this app (i.e. which Lights to update). You need it in order to configure the IP of your Ambilight TV and Hue Bridge.


## Install

* `npm install`
* `npm start`


## Debugging

### Can't connect to Philips TV

In order to open up the REST API on your TV you might need to enter the following sequence while watching TV:
`5646877223`.
Make sure you can access (TV model before 2014?):
http://\<ip-address\>:1925/1/doc/API.html

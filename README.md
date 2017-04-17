# lia-project
A home intelligent assistant for raspberry PI with an optional module for mechanical robot (GoPiGo - Dexter Industries).
Need Internet connexion for SpeechToText (Annyang js use native Chrome voice recognition) and TextToSpeech (Responsivevoice).

# Technologies
- Node 6.9.1 for raspberry pi
- SASS
- Grunt
- Bower
- MongoDB
- js ES5
- Socket.IO (to communicate between client interface and server)
- RSVP Promises
- Cordova (optional for app mobile)
- <a href="https://snowboy.kitt.ai/">Snowboy</a> (Hotword detection)
- Annyang js (SpeechToText. Native Chrome voice recognition)
- <a href="https://responsivevoice.org/">Responsivevoice js</a> (TextToSpeech)
- <a href="https://www.dexterindustries.com/gopigo/">GoPiGo - Dexter Industries</a> (For Robot control only)

# Current implemented Modules
- Get news of the day
- Get Date and Clock
- Youtube search (use browser with parsing result search html)
- Wikipedia search (use browser with parsing result search html)
- Soundcloud search (With api. Need key)
- Execute custom shell command

# Install
- npm install
- bower install
- MongoDB sudo apt-get install mongodb-server
- Snowboy http://docs.kitt.ai/snowboy/#running-on-raspberry-pi
- Chromium Browser for raspberry pi

# build
- grunt start

Client interface build in dist/ path. Server build in build/server.js

# run server
node build/server.js
and open https//localhost:9000 in Chromium

Client https run on port 9000 (to see interface https//localhost:9000).
You need run Client interface in a Chromium Browser and it need stay always opened. It's the client listen microphone.

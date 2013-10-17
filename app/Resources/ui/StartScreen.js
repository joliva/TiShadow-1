var LoginView = require('/ui/LoginView');
var Activity = require('/ui/Activity');
//Includes do not need to be included at runtime, just needed to trick
//require("/api/Includes");
var TiShadow = require('/api/TiShadow');
var NavBar = require("/ui/NavBar");
var Util = require("/api/Utils");
var Styles = require("/ui/Styles");
Titanium.App.idleTimerDisabled = true;

exports.StartScreen = function() {
  var win = Ti.UI.createWindow(Styles.start.window);
  var app_list= new (require("/ui/AppList"))();
  app_list.addEventListener("launch", function(e) {
    activity.show();
    TiShadow.launchApp(e.app);
    activity.hide();
  });

  NavBar.add({
    win:win,
    connect: function() {
      login.show();
    }
  });
  var activity = new Activity("Connecting...");

  var label = Ti.UI.createLabel({
    text: "Not Connected",
    font: {
      fontSize: "10dp",
      fontWeight: "bold"
    },
    bottom:  "0dp",
    height: "20dp",
    textAlign: 'center',
    width: Ti.UI.FILL,
    color: "black",
    backgroundColor: "#adbedd"
  });

  win.add(label);
  win.add(app_list);
  var login = new LoginView();
  login.zIndex = 10;
  function connect() {
    TiShadow.connect({
      host: Ti.App.Properties.getString("tishadow:address", "localhost"),
      port: Ti.App.Properties.getString("tishadow:port", "3000"),
      room: Ti.App.Properties.getString("tishadow:room", "default").trim() || "default",
      name: Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address,
      callback: function(o) {
        activity.hide();
        label.text = "Connected";
        login.hide();
        NavBar.setConnectEnabled(false);
      },
      onerror: function(o) {
        activity.hide();
        var isReconnectAlert = o && o.advice === "reconnect";
        label.text = "Connect Failed : Not Connected";
        if (o && !isReconnectAlert) {
          alert("Connect Failed\n\n" + Util.extractExceptionData(o));
        }
        if (!isReconnectAlert) {
          login.show();
          NavBar.setConnectEnabled(true);
        }
      },
      disconnected:  function(o) {
        label.text = "Not Connected";
        login.show();
        NavBar.setConnectEnabled(true);
      }
    });
  }
  login.addEventListener("connect", function(o) {
    activity.show();
    connect();
  });

  win.addEventListener('open', function() { 
    login.open();
  });

  Ti.App.addEventListener("tishadow:refresh_list", function(o) {
    app_list.refreshList();
  });

  return win;
};

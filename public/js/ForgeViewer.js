var viewer;

function launchViewer(urn) {
  var options = {
    env: "AutodeskProduction",
    getAccessToken: getForgeToken
  };
  //*
  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(
      document.getElementById("forgeViewer"),
      {
        extensions: [
          //   "MyAwesomeExtension",
          //   "handleselectionextension",
          //   "Autodesk.Sample.Navigator",
          //   "2d"
          // ]
          "MyAwesomeExtension",
          "CustomPropertyPanelExtension",
          "Autodesk.DocumentBrowser",

          "Autodesk.Viewing.MarkupsCore",
          "SharingViewer"
        ]
      }
    );

    // console.log("d", viewer);

    viewer.start();
    var documentId = "urn:" + urn;
    Autodesk.Viewing.Document.load(
      documentId,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    );
  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  const snapper = new Autodesk.Viewing.Extensions.Snapping.Snapper(viewer);
  // Autodesk.Viewing.

  console.log(snapper, snapper.activate());
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
  });
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error("onDocumentLoadFailure() - errorCode:" + viewerErrorCode);
}

function getForgeToken(callback = () => {}) {
  return fetch("/api/forge/oauth/token").then(res =>
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
      return data;
    })
  );
}

class ModelSummaryExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    console.log("ModelSummaryExtension has been loaded");
    return true;
  }

  unload() {
    // Clean our UI elements if we added any
    if (this._group) {
      this._group.removeControl(this._button);
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("ModelSummaryExtension has been unloaded");
    return true;
  }

  onToolbarCreated() {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl(
      "allMyAwesomeExtensionsToolbar"
    );
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(
        "allMyAwesomeExtensionsToolbar"
      );
      this.viewer.toolbar.addControl(this._group);
    }

    // Add a new button to the toolbar group
    this._button = new Autodesk.Viewing.UI.Button(
      "ModelSummaryExtensionButton"
    );
    this._button.onClick = ev => {
      // Execute an action here
    };
    this._button.setToolTip("Model Summary Extension");
    this._button.addClass("modelSummaryExtensionIcon");
    this._group.addControl(this._button);
  }
}
function getAllLeafComponents(viewer, callback) {
  var cbCount = 0; // count pending callbacks
  var components = []; // store the results
  var tree; // the instance tree

  function getLeafComponentsRec(parent) {
    cbCount++;
    if (tree.getChildCount(parent) != 0) {
      tree.enumNodeChildren(
        parent,
        function(children) {
          getLeafComponentsRec(children);
        },
        false
      );
    } else {
      components.push(parent);
    }
    if (--cbCount == 0) callback(components);
  }
  viewer.getObjectTree(function(objectTree) {
    tree = objectTree;
    var allLeafComponents = getLeafComponentsRec(tree.getRootId());
  });
}
Autodesk.Viewing.theExtensionManager.registerExtension(
  "ModelSummaryExtension",
  ModelSummaryExtension
);

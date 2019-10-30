var config = { extensions: ["Autodesk.Viewing.MarkupsCore"] };
var viewer = new Autodesk.Viewing.Viewer3D(container, config);
viewer.loadModel("myModelPath");

// After model finishes loading (async)
var extension = viewer.getExtension("Autodesk.Viewing.MarkupsCore");
// Enable user to start drawing markups over viewer
extension.enterEditMode();

// Remove markup drawing mode by calling leaveEditMode
extension.leaveEditMode();
// Set Arrow drawing tool by instantiating it's EditMode
var modeArrow = new Autodesk.Markups.Core.EditModeArrow(extension);
extension.changeEditMode(modeArrow);
// From now on, while in EditMode, the user will be drawing arrows.
//...
// Now let's switch into Text drawing tool:
var modeText = new Autodesk.Markups.Core.EditModeText(extension);
extension.changeEditMode(modeText);
// From now on, while in EditMode, the user will be drawing text boxes.
// Create a style object using an Utility function.
// Using this function is not a requirement, developers can create compatible styleObjects.
var styleAttributes = ["stroke-width", "stroke-color", "stroke-opacity"];
var nsu = Autodesk.Viewing.Extensions.Markups.Core.Utils;
var styleObject = nsu.createStyle(styleAttributes, extension.viewer);

// At this point, feel free to edit the values within styleObject...

// By calling setStyle() we will be applying the characteristics to both the Edit Mode (so that
// new markups will have the characteristics) and also to the currently selected markup.
extension.setStyle(styleObject);
// After user has created markups, get the data for further storage.
var markupsStringData = extension.generateData();
// Erase all markups onscreen, then load markups back onto the view
extension.clear();
extension.enterViewMode(); // Very important!!
extension.loadMarkups(markupsStringData, "Layer_1");
extension.loadMarkups(myMarkupString2, "Layer_2");
extension.loadMarkups(myMarkupString3, "Layer_3");
// Hide Layer_2
extension.hideMarkups("Layer_2");
// Show Layer_2 again
extension.showMarkups("Layer_2");

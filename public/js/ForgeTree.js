$(document).ready(function() {
  prepareAppBucketTree();
  $("#refreshBuckets").click(function() {
    $("#appBuckets")
      .jstree(true)
      .refresh();
  });

  $("#createNewBucket").click(function() {
    createNewBucket();
  });

  $("#createBucketModal").on("shown.bs.modal", function() {
    $("#newBucketKey").focus();
  });

  $("#hiddenUploadField").change(function() {
    var node = $("#appBuckets")
      .jstree(true)
      .get_selected(true)[0];
    var _this = this;
    if (_this.files.length == 0) return;
    var file = _this.files[0];
    switch (node.type) {
      case "bucket":
        var formData = new FormData();
        formData.append("fileToUpload", file);
        formData.append("bucketKey", node.id);

        $.ajax({
          url: "/api/forge/oss/objects",
          data: formData,
          processData: false,
          contentType: false,
          type: "POST",
          success: function(data) {
            $("#appBuckets")
              .jstree(true)
              .refresh_node(node);
            _this.value = "";
          }
        });
        break;
    }
  });
});

function createNewBucket() {
  var bucketKey = $("#newBucketKey").val();
  var policyKey = $("#newBucketPolicyKey").val();
  jQuery.post({
    url: "/api/forge/oss/buckets",
    contentType: "application/json",
    data: JSON.stringify({ bucketKey: bucketKey, policyKey: policyKey }),
    success: function(res) {
      $("#appBuckets")
        .jstree(true)
        .refresh();
      $("#createBucketModal").modal("toggle");
    },
    error: function(err) {
      if (err.status == 409) alert("Bucket already exists - 409: Duplicated");
      console.log(err);
    }
  });
}

// younes: this method takes the selected object and deletes it
async function deleteBucket(payload) {
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${payload.parent}/objects/${payload.text}`;
  console.log(payload, payload.parent, payload.id);

  const { access_token } = await getForgeToken();
  // console.log(access_token);
  return fetch(url, {
    method: "Delete",
    headers: { Authorization: "Bearer " + access_token }
  });
}
/****************************************************************************************** */
//Abed: Upload an object. If the specified object name already exists in the bucket,
// the uploaded content will overwrite the existing content for the bucket name/object name combination.

async function overWriteBucket(payload) {
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${payload.parent}/objects/${payload.text}`;
  console.log(payload, payload.parent, payload.id);
  const { access_token } = await getForgeToken();
  // console.log(url);
  return fetch(url, {
    method: "PUT",
    headers: { Authorization: "Bearer " + access_token },
    error: function(err) {
      if (err.status == 409) alert("Bucket already exists - 409: Duplicated");
      else {
        console.log("there is no error");
      }
    }
  });
}
/**-------------------------------------------------------------------------- */

function prepareAppBucketTree() {
  $("#appBuckets")
    .jstree({
      core: {
        themes: { icons: true },
        data: {
          url: "/api/forge/oss/buckets",
          dataType: "json",
          multiple: false,
          data: function(node) {
            return { id: node.id };
          }
        }
      },
      types: {
        default: {
          icon: "glyphicon glyphicon-question-sign"
        },
        "#": {
          icon: "glyphicon glyphicon-cloud"
        },
        bucket: {
          icon: "glyphicon glyphicon-folder-open"
        },
        object: {
          icon: "glyphicon glyphicon-file"
        }
      },
      plugins: ["types", "state", "sort", "contextmenu"],
      contextmenu: { items: autodeskCustomMenu }
    })
    .on("loaded.jstree", function() {
      $("#appBuckets").jstree("open_all");
    })
    .bind("activate_node.jstree", function(evt, data) {
      if (data != null && data.node != null && data.node.type == "object") {
        $("#forgeViewer").empty();
        var urn = data.node.id;
        getForgeToken(function(access_token) {
          jQuery.ajax({
            url:
              "https://developer.api.autodesk.com/modelderivative/v2/designdata/" +
              urn +
              "/manifest",
            headers: { Authorization: "Bearer " + access_token },
            success: function(res) {
              if (res.status === "success") launchViewer(urn);
              else
                $("#forgeViewer").html(
                  "The translation job still running: " +
                    res.progress +
                    ". Please try again in a moment."
                );
            },
            error: function(err) {
              var msgButton =
                "This file is not translated yet! " +
                '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
                "Start translation</button>";
              $("#forgeViewer").html(msgButton);
            }
          });
        });
      }
    });
}

function autodeskCustomMenu(autodeskNode) {
  var items;

  switch (autodeskNode.type) {
    case "bucket":
      items = {
        uploadFile: {
          label: "Upload file",
          action: function() {
            uploadFile();
          },
          icon: "glyphicon glyphicon-cloud-upload"
        }
      };
      break;
    case "object":
      items = {
        translateFile: {
          label: "Translate",
          action: function() {
            var treeNode = $("#appBuckets")
              .jstree(true)
              .get_selected(true)[0];
            translateObject(treeNode);
          },
          icon: "glyphicon glyphicon-eye-open"
        },
        //Abed: this adds for over write
        overWrite: {
          label: "Over Wirte",
          action: function() {
            var treeNode = $("#appBuckets")
              .jstree(true)
              .get_selected(true)[0];
            overWriteBucket(treeNode).then(() => {
              $("#appBuckets")
                .jstree(true)
                .delete_node(treeNode);
            });
          },
          icon: "glyphicon glyphicon-folder-open"
        },

        // younes: this adds a new item to the contextual menu
        delete: {
          label: "delete",
          action: () => {
            const treeNode = $("#appBuckets")
              .jstree(true)
              .get_selected(true)[0];
            deleteBucket(treeNode).then(() => {
              $("#appBuckets")
                .jstree(true)
                .delete_node(node);
            });
          }
        }
      };
  }

  return items;
}

function uploadFile() {
  $("#hiddenUploadField").click();
}

function translateObject(node) {
  $("#forgeViewer").empty();
  if (node == null)
    node = $("#appBuckets")
      .jstree(true)
      .get_selected(true)[0];
  var bucketKey = node.parents[0];
  var objectKey = node.id;
  jQuery.post({
    url: "/api/forge/modelderivative/jobs",
    contentType: "application/json",
    data: JSON.stringify({ bucketKey: bucketKey, objectName: objectKey }),
    success: function(res) {
      $("#forgeViewer").html(
        "Translation started! Please try again in a moment."
      );
    }
  });
}

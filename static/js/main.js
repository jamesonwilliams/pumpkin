/*
 * The POST URI for the documents server.
 */
const docsBase =
    'http://ec2-54-190-25-232.us-west-2.compute.amazonaws.com:8080/documents';

/*
 * Simple MDE instance.
 */
var simplemde = new SimpleMDE({
    autofocus: true,
    toolbar: false,
    autosave: {
        enabled: true,
        uniqueId: "MyUniqueID",
        delay: 1000,
    },
    element: document.getElementById("editor"),
    status: ["autosave"],
    tabSize: 4,
    indentWithTabs: false
});

/*
 * POSTs the markdown to the document server when the submit button is
 * clicked.
 */
$('#submit').click(function() { 
    var json = JSON.stringify({
        "name": "Unknown Title",
        "content": window.btoa(simplemde.value()),
        "type": "base64_markdown",
        "published": new Date().toISOString().substring(0, 10)
    });

    $.post(docsBase, json).done(function(data) {
        $('#output').text(docsBase + "/" + data.documentId);
    });
});


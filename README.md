# pumpkin
A modern web stack for publishing git-revisioned Markdown into Beautiful HTML.

## UI
### Login
Login is piggy-backed from (?)
    - Google; everyone has one

### Editor
The editor works like https://medium.com/new-story, but dynamically
transforms inputted markdown on the fly.

Uses [showdown][showdown] and [RxJS][rxjs] to display draft of
publication content.

Editor support direct automatic upload of assets to s3 asset bucket.

publish request gets routed to markdown server which accepts a post
object, looking something like:

POST to https://pumpkin.tld/publish

    {
        "metadata":{
            "title": "my title",
            "author": "your name",
            "assets": [
                "s3://asset.foo",
                "cdn://asset.bar",
                ...
            ]
            ....
        },
        "content": "base64 of markdown"
    }

The details of this data format should be informed by WordPress's
`wp_posts` MySQL table.

Response is full entity of metadata (with backend fields populated) and
content field to confirm.

TODO evaluate:
  - [commonmark.js][commonmark] looks good
  - [simplemde.com][simplemde] promising
  - [ckeditor.com][ckeditor] pretty outlandish
  - [Comparison of Markdown Editors][markdown-comparison] 
  - [Alloy Editor][alloy-editor] probably same family as mediums editor


### Display Article

GET https://pumpkin.tld/article/ID

On client cache miss, calls nginx. On backend cache miss, calls frontend
render box. Front end render box uses [Black Friday][black-friday] to
transform markdown documents. The rendered obtains the docs by calling
the local markdown server.

markdown server is a fascade to a blob store microservice. blob store
microservice implements revisionined cruds on documents, and is
essentially a "git as a service" rest api.

CDN is used for commonly shared assets (svg, css, javascripts, static
html)

### Describe articles

API works like AWS Describe APIs. Should also reference WordPress page
listing mechanisms to ensure minimum viable product.

`GET https://pumpkin.tld/articles`
`GET https://pumpkin.tld/articles/page/PAGE`
`GET https://pumkpin.tld/articles/search/FILTER1/FILTER2`

    {
        [
            {
                "id": "uuid",
                "metadata": {
                    ...
                }
            },
            {
                "id": "uuid2",
                "metadata": {
                    ...
                }
            }
        ]
    }


## Stack

      ________________
     |                |
     |    browser     | 
     |________________|

            /\
            ||
            \/
     ___________________
    |                   | 
    | HTML5/RxJS/jQuery |    <===================++      
    |___________________|                        ||
                                                 ||              
            /\                                   ||              
            ||                                   ||              
            \/                                   ||              
     __________________            _____       _____________
    |                  |          |     |     |             |
    | nginx fastcgi    |          | s3  | <=> | cloudfront  |
    |    (container)   |          |     |     |             |
    |__________________|          |_____|     |_____________|
         /\           \\               
         || GET        \\ POST           
     ____||_____     __\/_DELETE     ____________
    |           |   | markdown |    |            |
    | frontend  |<==| server   |<==>| blob store |==> s3?
    | renderer  |GET|          |    | container  |==> dynamo?
    |  container|   | container|    |            |
    |___________|   |__________|    |____________|
         ||                           
         ||                            
         \/                             
       (to s3)                       

### Container service is either:
  - Docker, running atop a Debian KVM on a commodiy box
  - EC2 Container Service

### Rendering micro service is:
  - Written in node?
  - Written in go

Somehow, somewhere, html templates have to exist. And that has to be
clean and have a lot of separation of concerns. No PHP nonsense.

View-ViewModel-Model for presentation logic?

### Markdown server is:
  - most likely written in go since we're just presenting a domain api
    fascade to an object store. Don't to worry about the presentation
    crap

### Blob Store
    - Hopefully don't have to do much. Can be partial implementation of
    git paradigm, commit, push, pull
    - Probably want to store this securely even though most of it is
    intentionally published. Want to have the option not to.
    - Probably dynamo.

### Howto handle non-origin assets

There is still some fuzziness here. Need it to be transparent to the
editor and to the request APIs. Any article-specific assets should go to
the blob store and be revisioned and put into s3. Article content itself
could be put there as well, as a blob. Metadata should be put into a
dynamo posts table. Oh also there's a users table in dynamo.

The UI needs to support direct uploads. What component handles this?
Ultimately we just need to funnel this stuff to s3 and reference it.

all non-user generated assets are in a special bucket that is replicated
with cloud front. free cdns are used where possible for stuff we didn't
write (use jquery and rxjs public cdns.)


[black-friday]: https://github.com/russross/blackfriday
[showdown]: https://github.com/showdownjs/showdown
[rxjs]: https://github.com/Reactive-Extensions/RxJS
[commonmark]: http://spec.commonmark.org/dingus/
[simplemde]: https://simplemde.com/
[ckeditor]: http://ckeditor.com/
[markdown-comparison]: https://github.com/iDoRecall/comparisons/blob/master/JavaScript-WYSIWYG-editors.md
[alloy-editor]: http://alloyeditor.com/demo/

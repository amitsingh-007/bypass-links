# Bookmarks object structure stored in Firebase

```js
bookmarks : {
    folderList : {
        foldername_hash : { name, parentHash }
     },
    urlList : {
        url_hash : { url, title, personUid, parentHash }
    },
    folders : {
        foldername_hash : [
            {
                isDir : false,
                hash : url_hash
            },
            {
                isDir : true,
                hash : foldername_hash
            }
        ]
    }
}
```

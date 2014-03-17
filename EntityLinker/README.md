Entity Linker
=========================

The Entity Linker Mashup is a Mashup for [TargetProcess 3](http://www.targetprocess.com/3) that allows you to
link to other entities in TargetProcess in the description text.  Simply put `#(entity ID)` in the description text (for example: `#208`) will create a link to that entity the next time the text is displayed.

Installing the Mashup with TargetProcess 3 on demand
----------------------------------------------------

1. In your TP site, navigate to ```Settings > (System Settings) > Mashups```
2. Click "Add New Mashup"
3. In the "Name" field, enter "Entity Linker"
4. In the "Placeholders" field, enter ```footerPlaceholder```
5. Copy and paste the contents of the [EntityLinker.js](https://raw.github.com/TargetProcess/User-Contributed-Mashups/master/EntityLinker/EntityLinker.js) file in the "Code" box.
6. Click Save

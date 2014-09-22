Working On Time Tracker
============================

This mashup adds a start/stop time tracking option to the TP3 menu bar. 

![Working On Time Tracker](https://raw.github.com/TargetProcess/User-Contributed-Mashups/master/WorkingOnTimeTracker/wo-inactive.png)

It displays all assignables that can accept time entries for the current user that meet the following criteria:

1. The EntityState is not final.
2. Is in a current iteration or is in no iteration and the EntityState is not initial.
3. The responsible role for the current state of the item matches the role that the current user is assigned as.
4. The item is not filtered by other options (see below).

Items are grouped by project in an accordion layout and there is a ```Recently Worked On``` section that shows the last 5 items that the current user selected that are still valid to work on based on the above rules.

When a user selects an item from one of the lists, the current time is stored along with the item id. The menu item changes to a highlighted state to indicate that you are actively working on something and the item will now be displayed at the top of the list. The storage is checked whenever the mashup loads so that even if you logout and log into another browser session it will show the correct current status of what you are working on. Once you select a different item or click on the currently active item it will calculate the difference between the start and end time and update the time spent/remainaing on the item. If you work on the same item multiple times in a day it will update the time entry instead of adding a new one to prevent the generation of multiple input cells in the time sheet. The start and end timestamps are also recorded in the description of the time entry.

![Working On Time Tracker Active](https://raw.github.com/TargetProcess/User-Contributed-Mashups/master/WorkingOnTimeTracker/wo-active.png)

The mashup supports a couple options that could be configured on a per user basis; however, they are not currently exposed via the UI. You can adjust the default options by changing the ```options``` section of the mashup.

```
options = {
    maxRecent: 5,
    projectFilter: []
}
```

The ```maxRecent``` option controls how many items to remember for the ```Recently Worked On``` section. The ```projectFilter``` option allows you to specify project ids that should be excluded from the list of items to display.

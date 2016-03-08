// This mashup is based on the "Dark Theme" mashup from the Target Process Mashup gallery

tau
    .mashups
    .addDependency('tp3/mashups/topmenu')
    .addMashup(function(topMenu) {

        'use strict';

        var init = function() {

            var style = document.createElement("style");
            style.setAttribute('id', 'wt-style');
            style.appendChild(document.createTextNode(""));

            document.head.appendChild(style);

            var sheet = style.sheet;

            var addCSSRule = function(selector, rules, index) {
                if (sheet.insertRule) {
                    sheet.insertRule(selector + "{" + rules + "}", index);
                } else {
                    sheet.addRule(selector, rules, index);
                }
            };

            // add rules here
            // add !important to make sure default rules will be overwritten
            // sets the body background to white
			addCSSRule('.tau-board', 'background: #ffffff !important;');
			// sets the header of the body to off-white 
			addCSSRule('.tau-board-header', 'background: #f5f5f5 !important;');
			// makes the WT menu item bold when active
			addCSSRule('#topMenuItem1', 'color:#ffffff !important; font-weight:900 !important;');
        };
        topMenu.addItem('WT').onClick(function() {
            var $st = $(document).find('#wt-style');
            if ($st.length) {
                $st.remove();
            } else {
                init();
            }
        });

    });

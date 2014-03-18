/*
  @author Fred Wu
  @author https://github.com/fredwu
  @license http://fredwu.mit-license.org/
*/

tau.mashups
  .addDependency('libs/jquery/jquery')
  .addMashup(function($, config) {
    function alwaysShowSearchBar() {
      return setTimeout(function() {
        $('.tau-search-close').hide();
        $('.tau-main-menu').css('margin-right', '300px');
        $('.tau-menu-item-search').addClass('tau-menu-item-search-open').css({
          'position': 'absolute', 'margin-left': '380px'
        });

        // forces webkit to redraw
        // @see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
        $('<style></style>').appendTo($('.tau-main-menu')).remove();
      }, 3000);
    }

    $(alwaysShowSearchBar);
  });

/*
  @author Fred Wu
  @author https://github.com/fredwu
  @license http://fredwu.mit-license.org/

  Based on Tag Linker for TargetProcess 2+
  @see https://github.com/TargetProcess/MashupsLibrary/tree/master/Tag%20Linker
*/

tau.mashups
  .addDependency('jQuery')
  .addDependency('tau/configurator')
  .addMashup(function ($, configurator) {
    function renderEntityLinks () {
      return setInterval(function () {
        $('.ui-description .ui-description__inner:not(:has(>.tag-links-replaced))').add(
          '.ui-comment-text:not(:has(>.tag-links-replaced))'
        ).each(function () {
          $(this).wrapInner('<div class="tag-links-replaced"></div>');

          var scoped  = this;
          var pattern = /#(\d+)/g;
          var matches = [];

          while (capture = pattern.exec($(this).html())) {
            matches.push(capture);
          };

          matches.forEach(function (match) {
            var id      = match[1];
            var matched = match[0];

            $.ajax({
              type: 'GET',
              url: (configurator.getApplicationPath() + '/api/v1/Generals/{0}?include=[EntityType]&format=json').f(id),
              context: $(scoped)[0],
              contentType: 'application/json',
              dataType: 'json',
              success: function (resp) {
                var replacement = "<a href='#page={0}/{1}'>{2}</a>".f(
                  resp.EntityType.Name.toLowerCase(), resp.Id, matched
                );
                $(scoped).html($(scoped).html().replace(matched, replacement));
              }
            });
          });
        });
      }, 2000);
    }

    $(document).ready(renderEntityLinks);
  });

String.prototype.f = function () {
  var s = this,
    i = arguments.length;
  while (i--)
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  return s;
};

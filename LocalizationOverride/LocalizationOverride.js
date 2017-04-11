tau.mashups
    .addDependency('Underscore')
    .addDependency('tau-intl')
    .addMashup(function(_, intl) {
        var ru = {
            'N/t': 'Нет ком.'
        };

        var en = {
            'N/t': 'No team'
        };

        var overrides = {
            ru: ru,
            en: en
        };

        var lang = intl.getCurrentLanguage();
        var override = overrides[lang.locale];

        if (override) {
            console.log('Using localization override for ' + lang.locale + ' locale.');

            var dictionary = lang.dictionary;
            _.each(override, function(text, key) {
                if (dictionary[key]) {
                    dictionary[key] = text;
                } else {
                    console.warn('Key "' + key + '" is not found in dictionary for ' + lang.locale + ' locale. ' +
                        'Please update your localization override if this key was changed in original dictionary, ' +
                        'or remove corresponding translation to free up some memory.');
                }
            })
        }
    });

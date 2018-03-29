tau.mashups
    .addDependency('jQuery')
    .addDependency('libs/d3/d3')
    .addDependency('tp3/mashups/topmenu')
    .addDependency('app.path')
    .addDependency('app.bus')
    .addDependency('tau/utils/utils.date')
    .addMashup(function($, d3, topmenu, appPath, appBus, dateUtils) {

        var user = window.loggedUser,
            path = appPath.get(),
            overlay = $('<div class="overlay" style="display: none">'),
            container = $('<div class="tau-bubble i-orientation_top" style="display: none"><div class="tau-bubble__arrow" role="arrow" data-orientation="top" style="top: 0px; left: 288px"></div><div class="tau-bubble__inner tau-bubble__inner_without_scroll i-content_workingon" role="content"><h3>Working On</h3><span class="workingon-option active"></span></div></div>'),
            urls = {
                workingOn: path + "/storage/v1/status/workingOn",
                // Feature is the only assignable that cannot accept time entries (why?)
                assignables: path + "/api/v1/Users/" + user.id + "/Assignables?format=json&take=1000&include=[name,numericPriority,iteration[startDate,endDate],project,entityType,entityState[name,role,isInitial],assignments[generalUser,role]]&where=(entityState.isFinal eq 'false') and (entityType.name ne 'Feature') and (entityState.role is not null)",
                times: path + "/api/v1/Times?format=json",
                roleEffort: function(assignableId, roleId) {
                    return path + "/api/v1/Assignables/" + assignableId + "/RoleEfforts?format=json&include=[timeRemain]&where=(role.id eq " + roleId + ")";
                }
            },
            workingOn = {},
            options = {
                maxRecent: 5,
                projectFilter: []
            },
            validItems = {},
            clearCached = true,
            rendered = false,
            timeFmt = d3.time.format('%a %b %e %Y @ %I:%M %p');

        function createWorkingOnList() {
            function list(bus) {
                bus.on('contentRendered', function() {
                    if (rendered) {
                        return;
                    }

                    $('head').append('<style type="text/css">'
                        + '.ghosted {color: #aaa; font-style: italic;} '
                        + '.workingon-section {list-style-type: none} '
                        + '.workingon-option {cursor: pointer; display: block; padding: 3px 0 3px 0; margin-bottom: 10px} '
                        + '.workingon-option:hover {background-color: #E3F5D7 !important} '
                        + '.workingon-option.active:hover {background-color: #FF575D !important} '
                        + '.workingon-option.active.empty {cursor: default} '
                        + '.workingon-option.active.empty:hover {background-color: initial !important} '
                        + '.i-content_workingon {width: 350px; font-size: 12px; padding: 10px} '
                        + '.i-content_workingon > h3 {margin: 0 0 5px 0;} '
                        + '.overlay {position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 998;} '
                        + '.i-role-workingon.active {color: lightgreen} '
                        + '.i-role-workingon.active:hover {color: limegreen !important} '
                        + '.ui-accordion-header {margin: 2px 2px 0 2px; line-height: 20px; font-size: 14px; padding-left: 10px; cursor: pointer; border: 1px solid rgb(230, 230, 230); border-radius: 4px; background-color: rgb(245, 246, 247);} '
                        + '.ui-accordion {margin-top: 10px} '
                        + '.ui-accordion-content {border: 1px solid rgb(230, 230, 230); margin: -1px 2px 2px 2px; padding: 5px; max-height: 500px; overflow-y: auto;} '
                        + '.ui-accordion-content .workingon-option:last-child {margin: 0} '
                        + '.workingon-option .tau-entity-icon, .workingon-option .title {display: inline-block; margin-right: 5px; vertical-align: bottom} '
                        + '.workingon-option .title {white-space: nowrap; overflow: hidden; max-width: 286px} '
                        + '.workingon-option.active .title {width: 135px} '
                        + '.date-time {font-size: 10px; width: 138px; display: inline-block; margin: 0} '
                        + '</style>');

                    var $menuItem = $('<div class="tau-main-menu__item"><span class="tau-popup-link i-role-workingon" title="Nothing">Working On</span></div>').on('click', function() {
                        list.show(this);
                    });
                    $('.tau-menu-item-timesheet').after($menuItem);
                    $('div.tau-app-main-pane').append(container).append(overlay);
                    overlay.on('click', function() {
                        list.hide();
                    });
                    rendered = true;
                    list.getWorkingOn();
                });

                return list;
            }

            list.getWorkingOn = function() {
                $.getJSON(urls['workingOn']).then(function(data) {
                    list.loadActive(data);
                }, function() {
                    list.loadActive({publicData: {}, userData: {}});
                });
            };

            list.startWork = function(item) {
                function startCB() {
                    workingOn.id = String(item.Id);

                    if (workingOn.recent.indexOf(workingOn.id) >= 0) {
                        workingOn.recent.splice(workingOn.recent.indexOf(workingOn.id), 1);
                    }

                    list.hide();

                    $.ajax({
                        type: "POST",
                        url: urls['workingOn'],
                        contentType: "application/json",
                        data: JSON.stringify({
                            userData: {
                                id: workingOn.id,
                                type: item.EntityType.Name.toLowerCase(),
                                title: item.Name,
                                project: String(item.Project.Id),
                                role: String(item.EntityState.Role.Id),
                                started: timeFmt(new Date()),
                                recent: JSON.stringify(workingOn.recent)
                            },
                            scope: 'Public'
                        })
                    }).done(function() {
                        list.getWorkingOn();
                    }).fail(function() {
                        alert("Failed to start work on #" + workingOn.id + "!");
                    });
                }

                list.stopWork(startCB)();
                return list;
            };

            list.stopWork = function(doneCB) {
                return function() {
                    if (workingOn.id == null) {
                        if (doneCB != null) {
                            doneCB();
                        }
                        return list;
                    }

                    $.getJSON(urls['roleEffort'](workingOn.id, workingOn.role), function(data) {
                        var remain = 0.0;
                        if (data.Items.length > 0) {
                            remain = data.Items[0].TimeRemain;
                        }
                        var started = timeFmt.parse(workingOn.started),
                            ended = new Date()
                        hours = Math.round((ended.getTime() - started.getTime()) / 36000.0) / 100.0,
                            time = {
                                Description: "Auto tracked from " + started.toISOString() + " to " + ended.toISOString(),
                                Spent: hours,
                                Remain: Math.max(0.0, remain - hours),
                                Project: {Id: parseInt(workingOn.project)},
                                User: {Id: user.id},
                                Role: {Id: parseInt(workingOn.role)},
                                Assignable: {Id: parseInt(workingOn.id)}
                            };

                        $.getJSON(urls['times'] + '&where=(user.id eq ' + user.id + ') and (assignable.id eq ' + workingOn.id + ') and (role.id eq ' + workingOn.role + ') and (date eq "' + ended.toISOString().substr(0, 10) + '")',
                            function(data) {
                                if (data.Items.length > 0) {
                                    time.Id = data.Items[0].Id;
                                    if (data.Items[0].Description != null) {
                                        time.Description += "\n\n" + data.Items[0].Description;
                                    }
                                    time.Spent += data.Items[0].Spent;
                                }

                                $.ajax({
                                    type: "POST",
                                    url: urls['times'],
                                    contentType: "application/json",
                                    data: JSON.stringify(time)
                                }).fail(function() {
                                    alert("Failed to post " + hours + " hours to #" + time.Assignable.Id + ". Please input it on your timesheet manually.");
                                });
                            });

                        workingOn.recent.unshift(workingOn.id);
                        list.hide();
                        $.ajax({
                            type: "POST",
                            url: urls['workingOn'],
                            contentType: "application/json",
                            data: JSON.stringify({
                                userData: {
                                    id: "",
                                    type: "",
                                    title: "",
                                    project: "",
                                    role: "",
                                    started: "",
                                    recent: JSON.stringify(workingOn.recent.slice(0, options.maxRecent))
                                },
                                scope: 'Public'
                            })
                        }).done(function() {
                            list.getWorkingOn();
                            if (doneCB != null) {
                                doneCB();
                            }
                        }).fail(function() {
                            alert("Failed to stop work on #" + workingOn.id + "!");
                        });
                    });
                    return list;
                };
            };

            list.loadOptions = function(data) {
                if (data.maxRecent) {
                    options.maxRecent = data.maxRecent;
                }
                if (data.projectFilter) {
                    options.projectFilter = JSON.parse(data.projectFilter);
                }
            };

            list.loadActive = function(data) {
                list.loadOptions(data.publicData);
                list.loadOptions(data.userData);
                workingOn = data.userData;

                if (typeof(workingOn.id) === "undefined" || workingOn.id === "") {
                    container.find('.workingon-option.active').addClass('empty')
                        .off('click').html('<span class="ghosted">Nothing</span>');
                    $('.i-role-workingon').removeClass('active').attr('title', 'Nothing');
                    workingOn.id = null;
                } else {
                    var option = '<em class="tau-entity-icon tau-entity-icon--' + workingOn.type + '">' + workingOn.id + '</em>' +
                        '<span class="title">' + workingOn.title + '</span>' +
                        '<span class="ghosted">Since:</span>' +
                        '<span class="date-time">' + workingOn.started + '</span>';
                    container.find('.workingon-option.active').removeClass('empty')
                        .off('click').html(option).on('click', list.stopWork(null));
                    $('.i-role-workingon').addClass('active').attr('title', '#' + workingOn.id + ' ' + workingOn.title);
                }

                if (workingOn.recent) {
                    workingOn.recent = JSON.parse(workingOn.recent);
                } else {
                    workingOn.recent = [];
                }

                if (container.css('display') != "none") {
                    $.getJSON(urls['assignables'], list.loadAssignables);
                }
            };

            list.loadAssignables = function(data) { //TODO: add lock to prevent multiple calls from stepping on one another
                var today = new Date(),
                    tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                if (clearCached) {
                    validItems = {};
                }
                data.Items.forEach(function(a) {
                    if (String(a.Id) === String(workingOn.id)) {
                        return;
                    }
                    if (a.Iteration != null && dateUtils.convertToTimezone(dateUtils.parse(a.Iteration.StartDate))[0] >= tomorrow) {
                        return;
                    }
                    if (a.Iteration != null && dateUtils.convertToTimezone(dateUtils.parse(a.Iteration.EndDate))[0] < today) {
                        return;
                    }
                    if (a.EntityState.IsInitial && a.Iteration == null) {
                        return;
                    }
                    if (options.projectFilter.indexOf(a.Project.Id) >= 0) {
                        return;
                    }
                    a.Assignments.Items.forEach(function(assignedTo) {
                        if (assignedTo.GeneralUser.Id == user.id && assignedTo.Role.Id == a.EntityState.Role.Id) {
                            validItems[a.Id] = a;
                        }
                    });
                    if (typeof(validItems[a.Id]) === "undefined" && typeof(a.Assignments.Next) != "undefined") {
                        // TODO: load remaining assignments. For now assume the role assigned is irrelevant
                        validItems[a.Id] = a;
                    }
                });

                if (typeof(data.Next) != "undefined") {
                    clearCached = false;
                    $.getJSON(data.Next, list.loadAssignables);
                    return list;
                }
                clearCached = true;
                var todoList = [{name: 'Recently Worked On', items: []}];
                var validRecent = [];
                workingOn.recent.forEach(function(r) {
                    if (typeof(validItems[r]) != "undefined") {
                        validRecent.push(r);
                        todoList[0].items.push(validItems[r]);
                    }
                });
                workingOn.recent = validRecent;

                var itemsByProject = {};
                d3.values(validItems).forEach(function(item) {
                    var project = item.Project.Name;
                    if (typeof(itemsByProject[project]) === "undefined") {
                        itemsByProject[project] = [];
                    }
                    itemsByProject[project].push(item);
                });

                var prioritize = function(a, b) {
                    return (a.NumericPriority > b.NumericPriority) ? -1 : (a.NumericPriority < b.NumericPriority) ? 1 : 0;
                };

                d3.entries(itemsByProject).forEach(function(e) {
                    todoList.push({
                        name: e.key,
                        items: e.value.sort(prioritize)
                    });
                });

                var accordion = $('<div class="workingon-accordion">'),
                    sections = d3.select(accordion[0]).selectAll('.workingon-section')
                        .data(todoList).enter().append('li')
                        .attr('class', 'workingon-section');
                sections.append('h3').text(function(d) {
                    return d.name;
                });
                var items = sections.append('div').attr('style', 'padding: 3px').selectAll('.workingon-option')
                    .data(function(d) {
                        return d.items;
                    }).enter()
                    .append('span')
                    .attr('class', 'workingon-option')
                    .attr('title', function(d) {
                        return 'Project: ' + d.Project.Name + ', State: ' + d.EntityState.Name + ', Title: ' + d.Name;
                    });
                items.append('em')
                    .attr('class', function(d) {
                        return 'tau-entity-icon tau-entity-icon--' + d.EntityType.Name.toLowerCase();
                    })
                    .text(function(d) {
                        return String(d.Id);
                    });
                items.append('span')
                    .attr('class', 'title')
                    .text(function(d) {
                        return d.Name;
                    });
                items.on('click', list.startWork);

                container.find('.loading').remove();
                container.find('.i-content_workingon').append(accordion);
                accordion.accordion({heightStyle: "content"});

                return list;
            };

            list.show = function(e) {
                var left = $(e).offset().left + Math.floor(e.clientWidth / 2) - 530;
                overlay.css('display', 'block');
                container.css('left', left + 'px').css('top', '0px').css('display', 'block').css('visibility', 'visible');
                list.getWorkingOn();
                return list;
            };

            list.hide = function() {
                overlay.css('display', 'none');
                container.css('display', 'none').css('visibility', 'hidden');
                container.find('.workingon-accordion').remove();
                container.find('.i-content_workingon').append('<span class="loading">Loading...</span>');
                return list;
            };

            return list;
        }

        var list = createWorkingOnList();

        if (appBus.done) {
            appBus.done(list)
        } else {
            list(appBus);
        }
    });

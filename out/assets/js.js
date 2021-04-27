$(function () {
    var sanitize = function (inp) {
        if (inp === '') {
            return 'empty';
        }
        return inp.replace(/[^\w\d-]/, '_').toUpperCase();
    }

    var searchRecursive = function (inp, original) {
        $.get('/data/' + sanitize(inp) + '.json').done(function (resp) {
            if (resp[0] === 'i') {
                // we've hit an internal node
                var suggestionLen = resp[1][0].length;
                if (suggestionLen <= original.length) {
                    return searchRecursive(original.substr(0, suggestionLen), original);
                } else {
                    var output = [];
                    resp[1].forEach(function (r) {
                        var sanitizedR = encodeURIComponent(r);
                        output.push('<a class="list-group-item list-group-item-action trigger-refresh" data-id="' + sanitizedR + '" href="#' + sanitizedR + '">' + r + '…</a>');
                    });
                    $('.output').html('<div class="list-group list-group-flush">' + output.join('') + '</div>');
                }
            } else {
                var output = [];
                resp[1].forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        var sanitizedR = encodeURIComponent(r);
                        output.push('<a class="list-group-item list-group-item-action" data-id="' + sanitizedR + '" target="_blank" href="https://d-portal.org/q.html?aid=' + sanitizedR + '">' + r + '</a>');
                    }
                });
                if (output.length === 0) {
                    $('.output').html('<ul class="list-group list-group-flush"><li class="list-group-item">Not found.</li></ul>');
                } else {
                    $('.output').html('<div class="list-group list-group-flush">' + output.join('') + '</div>');
                }
            }
        }).fail(function () {
            $('.output').html('<ul class="list-group list-group-flush"><li class="list-group-item">Not found.</li></ul>');
        });
    }

    var updateHash = function (newHash) {
        history.pushState(null, null, '#' + newHash);
    }

    var updateInput = function (inp) {
        $('.activity-id').val(inp);
    }

    var search = function (inp) {
        searchRecursive(inp.substr(0, 1), inp);
    }

    $('.activity-id').on('input', function (a) {
        var inp = $(this).val();
        updateHash(inp);
        search(inp);
    });

    $('main').on('click', '.trigger-refresh', function () {
        var inp = String($(this).data('id'));
        updateInput(inp);
        updateHash(inp);
        search(inp);
        $('.activity-id').focus();
    });

    $(window).on('load popstate pushstate', function() {
        var pageHash = window.location.hash.substr(1);
        updateInput(pageHash);
        search(pageHash);
    });
});

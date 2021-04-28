$(function () {
    var sanitize = function (inp) {
        if (inp === '') {
            return 'empty';
        }
        return inp.replace(/[^\w\d-]/, '_').toUpperCase();
    }

    var searchRecursive = function (inp, original, cb) {
        return $.get('/data/' + sanitize(inp) + '.json').done(function (resp) {
            if (resp[0] === 'l') {
                var output = [];
                var results = [];
                resp[1].forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        results.push(r);
                    }
                });
                cb(results, resp[0]);
            } else {
                // we've hit an internal node
                var suggestionLen = resp[1][0].length;
                if (suggestionLen <= original.length) {
                    searchRecursive(original.substr(0, suggestionLen), original, cb);
                } else {
                    var output = [];
                    if (resp[1][0].toUpperCase().indexOf(original.toUpperCase()) !== 0) {
                        cb([], 0);
                    } else {
                        cb(resp[1], resp[0]);
                    }
                }
            }
        }).fail(function () {
            cb([], 0);
        });
    }

    var updateHash = function (newHash) {
        history.pushState(null, null, '#' + newHash);
    }

    var updateInput = function (inp) {
        $('.activity-id').val(inp);
    }

    var search = function (inp) {
        $('.activity-id').removeClass('is-valid is-invalid');
        searchRecursive(inp.substr(0, 1), inp, function (resp, type) {
            if (resp.length === 0) {
                $('.activity-id').addClass('is-invalid');
                $('.output').html('<ul class="list-group list-group-flush"><li class="list-group-item">Not found</li></ul><small class="float-right">0 identifiers found</small>');
            } else {
                var output = [];
                var more = (type === 'l') ? '' : '…';
                var count = (type === 'l') ? resp.length : type;
                var plural = (count === 1) ? '' : 's';
                resp.forEach(function (r) {
                    var sanitizedR = encodeURIComponent(r);
                    output.push('<a class="list-group-item list-group-item-action" data-id="' + sanitizedR + '" href="#' + sanitizedR + '">' + r + more + '</a>');
                });
                $('.output').html('<div class="list-group list-group-flush results">' + output.join('') + '</div><small class="float-right">' + Number(count).toLocaleString() + ' identifier' + plural + ' found</small>');

                if (resp.length === 1 && resp[0] === inp) {
                    var urlInp = encodeURIComponent(inp);
                    $('.list-group').hide();
                    $('.activity-id').addClass('is-valid');
                    $('.output').html('<a class="btn btn-primary mt-2 float-right" href="https://d-portal.org/q.html?aid=' + urlInp + '" target="_blank">View on d-portal</a>');
                }
            }
        });
    }

    $('.activity-id').on('input', function (a) {
        var inp = $(this).val();
        var urlInp = encodeURIComponent(inp)
        updateHash(urlInp);
        search(inp);
    });

    $('.btn-clear').on('click', function () {
        $('.activity-id').val('').focus();
        updateHash('');
        search('');
    });

    $('main').on('click', '.results .list-group-item-action', function () {
        var urlInp = String($(this).data('id'));
        var inp = decodeURIComponent(urlInp);
        updateInput(inp);
        updateHash(urlInp);
        search(inp);
        $('.activity-id').focus();
    });

    $(window).on('load popstate pushstate', function() {
        var urlInp = window.location.hash.substr(1);
        var inp = decodeURIComponent(urlInp);
        updateInput(inp);
        search(inp);
    });
});

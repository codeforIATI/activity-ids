$(function () {
    var sanitize = function (inp) {
        if (inp === '') {
            return 'empty';
        }
        return inp.replace(/[^\w\d-]/, '_').toUpperCase();
    }

    var searchRecursive = function (inp, original, cb) {
        return $.get('/data/' + sanitize(inp) + '.json').done(function (resp) {
            if (resp[0] === 'i') {
                // we've hit an internal node
                var suggestionLen = resp[1][0].length;
                if (suggestionLen <= original.length) {
                    searchRecursive(original.substr(0, suggestionLen), original, cb);
                } else {
                    var output = [];
                    resp[1].forEach(function (r) {
                        var sanitizedR = encodeURIComponent(r);
                        output.push('<a class="list-group-item list-group-item-action" data-id="' + sanitizedR + '" href="#' + sanitizedR + '">' + r + '…</a>');
                    });
                    $('.output').html('<div class="list-group list-group-flush results">' + output.join('') + '</div>');
                    cb(resp[1]);
                }
            } else {
                var output = [];
                var results = [];
                resp[1].forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        var sanitizedR = encodeURIComponent(r);
                        output.push('<a class="list-group-item list-group-item-action" data-id="' + sanitizedR + '" href="#' + sanitizedR + '">' + r + '</a>');
                        results.push(r);
                    }
                });
                if (output.length === 0) {
                    $('.output').html('<ul class="list-group list-group-flush"><li class="list-group-item">Not found.</li></ul>');
                } else {
                    $('.output').html('<div class="list-group list-group-flush results">' + output.join('') + '</div>');
                }
                cb(results);
            }
        }).fail(function () {
            $('.output').html('<ul class="list-group list-group-flush"><li class="list-group-item">Not found.</li></ul>');
            cb([]);
        });
    }

    var updateHash = function (newHash) {
        history.pushState(null, null, '#' + newHash);
    }

    var updateInput = function (inp) {
        $('.activity-id').val(inp);
    }

    var search = function (inp) {
        searchRecursive(inp.substr(0, 1), inp, function (output) {
            if (output.length === 1 && output[0] === inp) {
                var urlInp = encodeURIComponent(inp);
                $('.list-group').hide();
                $('.output').html('<a class="btn btn-primary mt-2 float-right" href="https://d-portal.org/q.html?aid=' + urlInp + '" target="_blank">View on d-portal</a>');
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

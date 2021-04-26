$(function () {
    var sanitize = function (inp) {
        if (inp === '') {
            return 'empty';
        }
        return inp.replace(/[^\w\d-]/, '_').toUpperCase();
    }

    var search = function (inp, original) {
        $.get('/data/' + sanitize(inp) + '.json').done(function (resp) {
            if (resp[0] === 'i') {
                // we've hit an internal node
                var suggestionLen = resp[1][0].length;
                if (suggestionLen <= original.length) {
                    return search(original.substr(0, suggestionLen), original);
                } else {
                    $('.output').html('<ul><li>' + resp[1].join('…</li><li>') + '…</li></ul>');
                }
            } else {
                var output = [];
                resp[1].forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        output.push('<li><a target="_blank" href="https://d-portal.org/q.html?aid=' + r + '">' + r + '</a></li>');
                    }
                });
                if (output.length === 0) {
                    $('.output').text('Not found.');
                } else {
                    $('.output').html('<ul>' + output.join('') + '</ul>');
                }
            }
        }).fail(function () {
            $('.output').text('Not found.');
        });
    }

    $('.activity-id').on('input', function (a) {
        var inp = $(this).val();
        search(inp.substr(0, 1), inp);
    });

    search('', '');
});

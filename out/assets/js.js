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
                    $('.output').html('<ul class="list-group"><li class="list-group-item">' + resp[1].join('…</li><li class="list-group-item">') + '…</li></ul>');
                }
            } else {
                var output = [];
                resp[1].forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        output.push('<a class="list-group-item list-group-item-action" target="_blank" href="https://d-portal.org/q.html?aid=' + r + '">' + r + '</a>');
                    }
                });
                if (output.length === 0) {
                    $('.output').html('<ul class="list-group"><li class="list-group-item">Not found.</li></ul>');
                } else {
                    $('.output').html('<div class="list-group">' + output.join('') + '</div>');
                }
            }
        }).fail(function () {
            $('.output').html('<ul class="list-group"><li class="list-group-item">Not found.</li></ul>');
        });
    }

    $('.activity-id').on('input', function (a) {
        var inp = $(this).val();
        search(inp.substr(0, 1), inp);
    });

    search('', '');
});

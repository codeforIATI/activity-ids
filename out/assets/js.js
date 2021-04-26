$(function () {
    var sanitize = function (inp) {
        return inp.replace(/[^\w\d-]/, '_').toUpperCase();
    }

    var search = function (inp, original) {
        $.get('/data/' + sanitize(inp) + '.json').done(function (resp) {
            if (resp === true) {
                // we've hit an internal node
                if (inp === original) {
                    $('.output').text('More than 500 results found.');
                } else {
                    return search(original.substr(0, inp.length + 1), original);
                }
            } else {
                var output = [];
                resp.forEach(function (r) {
                    if (r.toUpperCase().indexOf(original.toUpperCase()) === 0) {
                        output.push('<a target="_blank" href="https://d-portal.org/q.html?aid=' + r + '">' + r + '</a>');
                    }
                });
                if (output.length === 0) {
                    $('.output').text('Not found.');
                } else {
                    $('.output').html(output.join('<br>'));
                }
            }
        }).fail(function () {
            $('.output').text('Not found.');
        });
    }

    $('.activity-id').on('input', function (a) {
        var inp = $(this).val();
        if (inp !== '') {
            search(inp.substr(0, 1), inp);
        } else {
            $('.output').text('');
        }
    });
});

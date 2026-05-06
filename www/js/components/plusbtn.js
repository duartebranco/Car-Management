$(document).ready(function() {
    const $plusBtn = $('#plusBtn');
    const $fb = $('.floating-buttons');

    $plusBtn.on('click', function(e) {
        e.preventDefault();
        
        if ($fb.hasClass('show')) {
            $fb.removeClass('show d-flex').hide();
        } else {
            $fb.addClass('show d-flex').show();
        }
    });

    $fb.on('click', 'button[data-target]', function() {
        const target = $(this).data('target');
        if (target) window.location.href = target;
    });

    $(document).on('click', function(e) {
        if ($fb.hasClass('show') && !$fb.is(e.target) && $fb.has(e.target).length === 0 && !$plusBtn.is(e.target) && $plusBtn.has(e.target).length === 0) {
            $fb.removeClass('show d-flex').hide();
        }
    });

    $fb.on('click', function(e) {
        e.stopPropagation();
    });
});
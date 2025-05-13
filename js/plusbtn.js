$(document).ready(function() {
    $('#plusBtn').on('click', function(e) {
        e.preventDefault();
        const $fb = $('.floating-buttons');
        $fb.toggle();
        if ($fb.is(':visible')) {
            $fb.addClass('d-flex');
        } else {
            $fb.removeClass('d-flex');
        }
    });

    // Add navigation for floating-buttons
    $('.floating-buttons').on('click', 'button[data-target]', function() {
        const target = $(this).data('target');
        if (target) {
            window.location.href = target;
        }
    });

    // Hide floating-buttons when clicking outside
    $(document).on('click', function(e) {
        const $fb = $('.floating-buttons');
        const $plusBtn = $('#plusBtn');
        if (
            $fb.is(':visible') &&
            !$fb.is(e.target) && $fb.has(e.target).length === 0 &&
            !$plusBtn.is(e.target) && $plusBtn.has(e.target).length === 0
        ) {
            $fb.hide().removeClass('d-flex');
        }
    });

    // Prevent click inside floating-buttons from bubbling up
    $('.floating-buttons').on('click', function(e) {
        e.stopPropagation();
    });
});

$(function() {
const plusBtn = document.getElementById('plusBtn');
const floatingButtons = document.querySelector('.floating-buttons');

plusBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (floatingButtons.classList.contains('show')) {
        floatingButtons.classList.remove('show');
        floatingButtons.style.display = "none";
    } else {
        floatingButtons.classList.add('show');
        floatingButtons.style.display = "flex";
    }
});

// Fechar ao clicar fora
document.addEventListener('click', function(e) {
    if (!plusBtn.contains(e.target) && !floatingButtons.contains(e.target)) {
        floatingButtons.classList.remove('show');
        floatingButtons.style.display = "none";
    }
});
});
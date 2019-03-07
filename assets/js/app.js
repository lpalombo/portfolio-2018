document.addEventListener("DOMContentLoaded", function() {
    var FadeTransition = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.fadeOut()])
                .then(this.fadeIn.bind(this));
        },
    
        fadeOut: function () {
            var oldWrap = this.oldContainer;
            oldWrap.classList.toggle('fade-out');
    
            return new Promise(function (resolve, reject) {
                window.setTimeout(function () {
                    resolve();
                }, 700);
            });
        },
        fadeIn: function () {
            var newWrap = this.newContainer;
            newWrap.classList.toggle('fade-in');
            this.done();
        }
    });
    
    Barba.Pjax.getTransition = function () {
        return FadeTransition;
    };

    Barba.Pjax.start();
});